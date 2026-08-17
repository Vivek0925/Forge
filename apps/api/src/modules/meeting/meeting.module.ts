import { Module } from "@nestjs/common";

import { WorkspaceModule } from "../workspace/workspace.module";

import { MeetingController } from "./controllers/meeting.controller";
import { MeetingRepository } from "./repositories/meeting.repository";
import { MeetingService } from "./services/meeting.service";

@Module({
  imports: [WorkspaceModule],

  controllers: [
    MeetingController,
  ],

  providers: [
    MeetingService,
    MeetingRepository,
  ],

  exports: [
    MeetingService,
    MeetingRepository,
  ],
})
export class MeetingModule {}