import { Module } from "@nestjs/common";

import { WorkspaceModule } from "../workspace/workspace.module";

import { MeetingController } from "./controllers/meeting.controller";
import { MeetingRepository } from "./repositories/meeting.repository";
import { MeetingService } from "./services/meeting.service";
import { MeetingRoomService } from "./services/meeting-room.service";
import { GoogleCalendarModule } from "../../google-calendar/google-calendar.module";

@Module({
  imports: [WorkspaceModule, GoogleCalendarModule],

  controllers: [
    MeetingController,
  ],

  providers: [
    MeetingService,
    MeetingRepository,
    MeetingRoomService,
  ],

  exports: [
    MeetingService,
    MeetingRepository,
    MeetingRoomService,
  ],
})
export class MeetingModule {}