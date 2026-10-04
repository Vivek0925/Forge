import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { NotificationRealtimeService } from './notification-realtime.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: NotificationRealtimeService,
  ) {}

  findForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createMeetingScheduled(
    meetingId: string,
    workspaceId: string,
    creatorId: string,
    title: string,
    scheduledAt: Date,
  ) {
    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: { not: creatorId },
      },
      select: { userId: true },
    });

    if (members.length === 0) return;

    const formattedDate = scheduledAt.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    const notifications = members.map(({ userId }) => ({
        userId,
        type: NotificationType.MEETING_SCHEDULED,
        title: 'New meeting scheduled',
        message: `${title} starts on ${formattedDate} UTC.`,
        meetingId,
      }));

    await this.prisma.notification.createMany({ data: notifications });

    const createdNotifications = await this.prisma.notification.findMany({
      where: { meetingId, userId: { in: members.map(({ userId }) => userId) } },
      orderBy: { createdAt: 'desc' },
      take: members.length,
    });

    for (const notification of createdNotifications) {
      this.realtime.emitToUser(notification.userId, notification);
    }
  }
}
