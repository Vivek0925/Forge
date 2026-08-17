import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { WorkspaceService } from "../../workspace/services/workspace.service";

import { CreateMeetingDto } from "../dto/create-meeting.dto";
import { MeetingRepository } from "../repositories/meeting.repository";

@Injectable()
export class MeetingService {
  constructor(
    private readonly meetingRepository: MeetingRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(
    userId: string,
    workspaceSlug: string,
    dto: CreateMeetingDto,
  ) {
    const workspace =
      await this.workspaceService.findWorkspaceBySlug(
        workspaceSlug,
      );

    const scheduledAt = dto.scheduledAt
      ? new Date(dto.scheduledAt)
      : undefined;

    /*
     * No scheduledAt = start immediately.
     * scheduledAt = create an upcoming meeting.
     */
    const status = scheduledAt
      ? "SCHEDULED"
      : "ACTIVE";

    const startedAt = scheduledAt
      ? undefined
      : new Date();

    return this.meetingRepository.create({
      title: dto.title,
      description: dto.description,
      scheduledAt,
      startedAt,
      status,
      workspaceId: workspace.id,
      createdById: userId,
    });
  }

  async findById(id: string) {
    const meeting =
      await this.meetingRepository.findById(id);

    if (!meeting) {
      throw new NotFoundException(
        "Meeting not found",
      );
    }

    return meeting;
  }

  async findWorkspaceMeetings(
    workspaceSlug: string,
  ) {
    const workspace =
      await this.workspaceService.findWorkspaceBySlug(
        workspaceSlug,
      );

    /*
     * Only currently relevant meetings are shown.
     *
     * ACTIVE     → live meetings
     * SCHEDULED  → upcoming meetings
     * ENDED      → hidden from this list
     */
    return this.meetingRepository.findByWorkspace(
      workspace.id,
    );
  }

  async start(id: string) {
    const meeting = await this.findById(id);

    if (meeting.status === "ENDED") {
      throw new BadRequestException(
        "Meeting has already ended",
      );
    }

    if (meeting.status === "ACTIVE") {
      return meeting;
    }

    return this.meetingRepository.start(id);
  }

  async end(id: string) {
    const meeting = await this.findById(id);

    if (meeting.status === "ENDED") {
      throw new BadRequestException(
        "Meeting has already ended",
      );
    }

    if (meeting.status !== "ACTIVE") {
      throw new BadRequestException(
        "Only an active meeting can be ended",
      );
    }

    return this.meetingRepository.end(id);
  }

  async join(
    meetingId: string,
    userId: string,
  ) {
    const meeting =
      await this.findById(meetingId);

    if (meeting.status === "ENDED") {
      throw new BadRequestException(
        "Meeting has ended",
      );
    }

    if (meeting.status !== "ACTIVE") {
      throw new BadRequestException(
        "Meeting has not started yet",
      );
    }

    return this.meetingRepository.join(
      meetingId,
      userId,
    );
  }

  async leave(
    meetingId: string,
    userId: string,
  ) {
    const meeting =
      await this.findById(meetingId);

    if (meeting.status === "ENDED") {
      throw new BadRequestException(
        "Meeting has ended",
      );
    }

    return this.meetingRepository.leave(
      meetingId,
      userId,
    );
  }
}