import { Module } from "@nestjs/common";

import { PrismaModule } from "./database/prisma.module";

import { AuthModule } from "./modules/auth/auth.module";
import { WorkspaceModule } from "./modules/workspace/workspace.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspaceModule,
  ],
})
export class AppModule {}