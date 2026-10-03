import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google } from 'googleapis';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../database/prisma.service';

const calendarOAuthStateLifetimeMs = 10 * 60 * 1000;

@Injectable()
export class GoogleCalendarService {
  private readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  );

  constructor(private readonly prisma: PrismaService) {}
  async getAuthorizationUrl(userId: string) {
    const state = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + calendarOAuthStateLifetimeMs);

    await this.prisma.googleCalendarOAuthState.create({
      data: {
        stateHash: this.hashState(state),
        userId,
        expiresAt,
      },
    });

    return {
      url: this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        state,
      }),
      state,
    };
  }

  async consumeAuthorizationState(state: string, userId: string): Promise<void> {
    const stateHash = this.hashState(state);
    const stateRecord = await this.prisma.googleCalendarOAuthState.findUnique({
      where: { stateHash },
    });

    if (
      !stateRecord ||
      stateRecord.userId !== userId ||
      stateRecord.expiresAt <= new Date() ||
      stateRecord.consumedAt
    ) {
      throw new UnauthorizedException('Invalid Google Calendar OAuth state');
    }

    const consumed = await this.prisma.googleCalendarOAuthState.updateMany({
      where: {
        stateHash,
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: {
        consumedAt: new Date(),
      },
    });

    if (consumed.count !== 1) {
      throw new UnauthorizedException('Invalid Google Calendar OAuth state');
    }
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);

    await this.prisma.googleCalendarConnection.upsert({
      where: {
        userId,
      },
      update: {
        accessToken: tokens.access_token ?? '',
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        userId,
        accessToken: tokens.access_token ?? '',
        refreshToken: tokens.refresh_token ?? '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });
  }

  private hashState(state: string) {
    return createHash('sha256').update(state).digest('hex');
  }

  async getConnectionStatus(userId: string) {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
      },
    });

    return {
      connected: !!connection,
    };
  }

  async createMeetingEvent(
    userId: string,
    meeting: {
      id: string;
      title: string;
      description?: string | null;
      scheduledAt: Date;
      meetingCode: string;
    },
  ) {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: {
        userId,
      },
    });

    if (!connection) {
      return null;
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    );

    auth.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken ?? undefined,
      expiry_date: connection.expiresAt?.getTime(),
    });

    const calendar = google.calendar({
      version: 'v3',
      auth,
    });

    const start = new Date(meeting.scheduledAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: meeting.title,
        description:
          meeting.description ?? `Forge meeting: ${meeting.meetingCode}`,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
        conferenceData: undefined,
      },
    });

    return event.data.id ?? null;
  }

  async updateMeetingEvent(
    userId: string,
    googleEventId: string,
    meeting: {
      title: string;
      description?: string | null;
      scheduledAt: Date;
    },
  ) {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: {
        userId,
      },
    });

    if (!connection) {
      return null;
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALENDAR_REDIRECT_URI,
    );

    auth.setCredentials({
      access_token: connection.accessToken,
      refresh_token: connection.refreshToken ?? undefined,
      expiry_date: connection.expiresAt?.getTime(),
    });

    const calendar = google.calendar({
      version: 'v3',
      auth,
    });

    const start = new Date(meeting.scheduledAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const event = await calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: {
        summary: meeting.title,
        description: meeting.description ?? undefined,
        start: {
          dateTime: start.toISOString(),
        },
        end: {
          dateTime: end.toISOString(),
        },
      },
    });

    return event.data.id ?? null;
  }
}
