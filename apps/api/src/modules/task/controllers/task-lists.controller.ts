import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';

import { CreateTaskListDto } from "../dto/create-task-list.dto";
import { UpdateTaskListDto } from "../dto/update-task-list.dto";
import { MoveTaskListDto } from "../dto/move-task-list.dto";
import { TaskListsService } from "../services/task-lists.service";

@Controller("workspaces/:slug/task-lists")
@UseGuards(JwtAuthGuard)
export class TaskListsController {
  constructor(
    private readonly taskListsService: TaskListsService,
  ) {}

  @Get()
  async getLists(
    @CurrentUser() user: CurrentUserData,
    @Param("slug") slug: string,
  ) {
    return this.taskListsService.findAll(user.id, slug);
  }

  @Post()
  async createList(
    @CurrentUser() user: CurrentUserData,
    @Param("slug") slug: string,
    @Body() dto: CreateTaskListDto,
  ) {
    return this.taskListsService.create(
      user.id,
      slug,
      dto.name,
    );
  }

  @Patch(":listId")
  async updateList(
    @CurrentUser() user: CurrentUserData,
    @Param("slug") slug: string,
    @Param("listId") listId: string,
    @Body() dto: UpdateTaskListDto,
  ) {
    return this.taskListsService.update(
      user.id,
      slug,
      listId,
      dto.name,
    );
  }

  @Patch(":listId/move")
  async moveList(
    @CurrentUser() user: CurrentUserData,
    @Param("slug") slug: string,
    @Param("listId") listId: string,
    @Body() dto: MoveTaskListDto,
  ) {
    return this.taskListsService.move(
      user.id,
      slug,
      listId,
      dto.position,
    );
  }
}