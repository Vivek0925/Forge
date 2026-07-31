import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { WorkspaceRole } from "@prisma/client";
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
    // Find workspace
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    // Check inviter membership
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

    // Only OWNER and ADMIN can invite
    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        "You don't have permission to invite members.",
      );
    }

    // Prevent duplicate invitation
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

    // Prevent inviting existing members
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


    // Create invitation token
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
}