import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';

import { CreateTaskCommentDto } from '../dto/create-task-comment.dto';
import { TaskCommentsService } from '../services/task-comments.service';

@Controller('workspaces/:slug/tasks/:taskId/comments')
@UseGuards(JwtAuthGuard)
export class TaskCommentsController {
  constructor(
    private readonly taskCommentsService: TaskCommentsService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
  ) {
    return this.taskCommentsService.findAll(
      user.id,
      slug,
      taskId,
    );
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserData,
    @Param('slug') slug: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.taskCommentsService.create(
      user.id,
      slug,
      taskId,
      dto.content,
    );
  }
}