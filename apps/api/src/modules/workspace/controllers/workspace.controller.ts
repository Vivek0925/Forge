import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { CurrentUserData } from "../../auth/interfaces/current-user.interface";

import { WorkspaceService } from "../services/workspace.service";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";

@Controller("workspaces")
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.create(user.id, dto);
  }

  @Get()
  findMine(
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.workspaceService.findMyWorkspaces(user.id);
  }
}