import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  InvitationStatus,
  WorkspaceRole,
} from "@prisma/client";
import { randomUUID } from "crypto";

import { WorkspaceService } from "../../workspace/services/workspace.service";
import { WorkspaceRepository } from "../../workspace/repositories/workspace.repository";

import { WorkspaceInvitationRepository } from "../repositories/workspace-invitation.repository";
import { CreateWorkspaceInvitationDto } from "../dto/create-workspace-invitation.dto";

@Injectable()
export class WorkspaceInvitationService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly invitationRepository: WorkspaceInvitationRepository,
  ) {}

  async getMyInvitations(email: string) {
    return this.invitationRepository.findPendingForUser(email);
  }

  async createInvitation(
    userId: string,
    workspaceSlug: string,
    dto: CreateWorkspaceInvitationDto,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const membership =
      await this.workspaceRepository.findMember(
        workspace.id,
        userId,
      );

    if (!membership) {
      throw new ForbiddenException(
        "You are not a member of this workspace.",
      );
    }

    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You don't have permission to invite members.",
      );
    }

    const existingInvitation =
      await this.invitationRepository.findPendingByEmail(
        workspace.id,
        dto.email,
      );

    if (existingInvitation) {
      throw new BadRequestException(
        "An invitation has already been sent.",
      );
    }

    const existingMember =
      await this.workspaceRepository.findMemberByEmail(
        workspace.id,
        dto.email,
      );

    if (existingMember) {
      throw new BadRequestException(
        "User is already a member of this workspace.",
      );
    }

    const token = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.invitationRepository.create({
      email: dto.email,
      workspaceId: workspace.id,
      invitedById: userId,
      role: dto.role ?? WorkspaceRole.MEMBER,
      token,
      expiresAt,
    });
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
  ) {
    const invitation =
      await this.invitationRepository.findById(
        invitationId,
      );

    if (!invitation) {
      throw new NotFoundException(
        "Invitation not found.",
      );
    }

    if (
      invitation.status !== InvitationStatus.PENDING
    ) {
      throw new BadRequestException(
        "Invitation has already been processed.",
      );
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException(
        "Invitation has expired.",
      );
    }

    const existingMember =
      await this.workspaceRepository.findMember(
        invitation.workspaceId,
        userId,
      );

    if (existingMember) {
      throw new BadRequestException(
        "You are already a member of this workspace.",
      );
    }

    await this.invitationRepository.completeInvitation({
  invitationId: invitation.id,
  workspaceId: invitation.workspaceId,
  userId,
  role: invitation.role,
});

    return {
      message: "Invitation accepted successfully.",
      workspace: invitation.workspace,
    };
  }
}