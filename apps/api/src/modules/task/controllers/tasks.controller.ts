import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';

import { CreateTaskDto } from '../dto/create-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

import { TasksService } from '../services/tasks.service';

@Controller('workspaces/:slug/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
  ) {
    return this.tasksService.findAll(
      user.id,
      slug,
    );
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(
      user.id,
      slug,
      dto,
    );
  }

  @Get(':taskId')
  async findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.findOne(
      user.id,
      slug,
      taskId,
    );
  }

  @Patch(':taskId')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(
      user.id,
      slug,
      taskId,
      dto,
    );
  }

  @Patch(':taskId/move')
  async move(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(
      user.id,
      slug,
      taskId,
      dto,
    );
  }

  @Delete(':taskId')
  async remove(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
  ) {
    return this.tasksService.remove(
      user.id,
      slug,
      taskId,
    );
  }
}