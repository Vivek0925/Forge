import { Module } from '@nestjs/common';
import { RealtimeGateway } from './gateway/realtime.gateway';
import { PresenceService } from './services/presence.service';
import { SocketAuthService } from './services/socket-auth.service';
import { PrismaModule } from '../../database/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],
  providers: [
    RealtimeGateway,
    PresenceService,
    SocketAuthService,
  ],
})
export class RealtimeModule {}