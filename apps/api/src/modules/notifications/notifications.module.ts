import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRealtimeService } from './notification-realtime.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationRealtimeService],
  exports: [NotificationsService, NotificationRealtimeService],
})
export class NotificationsModule {}
