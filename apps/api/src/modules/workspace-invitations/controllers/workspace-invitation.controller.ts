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

@Controller("workspaces/:slug/invitations")
@UseGuards(JwtAuthGuard)
export class WorkspaceInvitationController {
  constructor(
    private readonly workspaceInvitationService: WorkspaceInvitationService,
  ) {}

  @Post()
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
  @Get()
getMyInvitations(
  @CurrentUser() user: CurrentUserData,
) {
  return this.workspaceInvitationService.getMyInvitations(
    user.email,
  );
}
}