import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateway/realtime.gateway';
import { PresenceService } from './services/presence.service';
import { SocketAuthService } from './services/socket-auth.service';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { MeetingModule } from "../meeting/meeting.module";
import { WorkspaceModule } from '../workspace/workspace.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ChatModule,
    MeetingModule,
    WorkspaceModule,
    NotificationsModule,
  ],
  providers: [
    RealtimeGateway,
    PresenceService,
    SocketAuthService,
  ],
})
export class RealtimeModule {}