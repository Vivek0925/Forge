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

    return this.meetingRepository.create({
      title: dto.title,
      description: dto.description,
      scheduledAt: dto.scheduledAt
        ? new Date(dto.scheduledAt)
        : undefined,
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

    return this.meetingRepository.start(id);
  }

  async end(id: string) {
    const meeting = await this.findById(id);

    if (meeting.status === "ENDED") {
      throw new BadRequestException(
        "Meeting has already ended",
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

    return this.meetingRepository.join(
      meetingId,
      userId,
    );
  }

  async leave(
    meetingId: string,
    userId: string,
  ) {
    await this.findById(meetingId);

    return this.meetingRepository.leave(
      meetingId,
      userId,
    );
  }
}