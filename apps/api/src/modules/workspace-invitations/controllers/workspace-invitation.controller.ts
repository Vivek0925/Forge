import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { CurrentUserData } from "../../auth/interfaces/current-user.interface";

import { WorkspaceInvitationService } from "../services/workspace-invitation.service";
import { CreateWorkspaceInvitationDto } from "../dto/create-workspace-invitation.dto";

@Controller()
@UseGuards(JwtAuthGuard)
export class WorkspaceInvitationController {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Post("workspaces/:slug/invitations")
  createInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param("slug") slug: string,
    @Body() dto: CreateWorkspaceInvitationDto,
  ) {
    return this.workspaceInvitationService.createInvitation(
      user.id,
      slug,
      dto,
    );
  }

  @Get("invitations")
  getMyInvitations(
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workspaceInvitationService.getMyInvitations(
      user.email,
    );
  }

  @Post("invitations/:id/accept")
  acceptInvitation(
    @CurrentUser() user: CurrentUserData,
    @Param("id") id: string,
  ) {
    return this.workspaceInvitationService.acceptInvitation(
      id,
      user.id,
    );
  }
}