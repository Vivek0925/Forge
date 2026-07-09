import { Module } from "@nestjs/common";

import { PrismaModule } from "../../database/prisma.module";

import { WorkspaceController } from "./controllers/workspace.controller";
import { WorkspaceRepository } from "./repositories/workspace.repository";
import { WorkspaceService } from "./services/workspace.service";

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    WorkspaceRepository,
  ],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}