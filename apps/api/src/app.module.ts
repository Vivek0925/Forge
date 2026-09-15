import { Module } from "@nestjs/common";

import { PrismaModule } from "./database/prisma.module";

import { AuthModule } from "./modules/auth/auth.module";
import { WorkspaceModule } from "./modules/workspace/workspace.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { WorkspaceInvitationModule } from "./modules/workspace-invitations/workspace-invitation.module";
import { StorageModule } from "./modules/storage/storage.module";
import { MeetingModule } from "./modules/meeting/meeting.module";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
      ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 100,
    },
  ]),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    RealtimeModule,
    WorkspaceInvitationModule,
    StorageModule,
    MeetingModule,
  ],
  providers: [
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
],
})
export class AppModule {}