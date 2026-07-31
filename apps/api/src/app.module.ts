import { Module } from "@nestjs/common";

import { PrismaModule } from "./database/prisma.module";

import { AuthModule } from "./modules/auth/auth.module";
import { WorkspaceModule } from "./modules/workspace/workspace.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { WorkspaceInvitationModule } from "./modules/workspace-invitations/workspace-invitation.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    RealtimeModule,
    WorkspaceInvitationModule,
  ],
})
export class AppModule {}