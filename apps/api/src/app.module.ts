import { Module } from "@nestjs/common";

import { PrismaModule } from "./database/prisma.module";

import { AuthModule } from "./modules/auth/auth.module";
import { WorkspaceModule } from "./modules/workspace/workspace.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    RealtimeModule,
  ],
})
export class AppModule {}