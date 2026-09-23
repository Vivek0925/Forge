import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class GoogleCalendarService {
  private readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  );

  constructor(private readonly prisma: PrismaService) {}
  getAuthorizationUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
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
}
