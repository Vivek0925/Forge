import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceService } from '../../workspace/services/workspace.service';
import { TasksRepository } from '../repositories/tasks.repository';
import { TaskCommentsRepository } from '../repositories/task-comments.repository';

@Injectable()
export class TaskCommentsService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly tasksRepository: TasksRepository,
    private readonly commentsRepository: TaskCommentsRepository,
  ) {}

  async findAll(
    userId: string,
    workspaceSlug: string,
    taskId: string,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    return this.commentsRepository.findByTask(task.id);
  }

  async create(
    userId: string,
    workspaceSlug: string,
    taskId: string,
    content: string,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new BadRequestException(
        'Comment cannot be empty.',
      );
    }

    if (trimmedContent.length > 5000) {
      throw new BadRequestException(
        'Comment cannot exceed 5000 characters.',
      );
    }

    return this.commentsRepository.create(
      task.id,
      userId,
      trimmedContent,
    );
  }
}