import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { TaskStatus } from '@prisma/client';

import { WorkspaceService } from '../../workspace/services/workspace.service';

import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';

import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(userId: string, workspaceSlug: string, dto: CreateTaskDto) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    if (dto.assigneeId) {
      await this.validateAssignee(workspace.id, dto.assigneeId);
    }

    const position = await this.tasksRepository.getNextPosition(
      workspace.id,
      TaskStatus.TODO,
    );

    return this.tasksRepository.create({
      workspaceId: workspace.id,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: TaskStatus.TODO,
      position,
      createdById: userId,
    });
  }

  async findAll(userId: string, workspaceSlug: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    return this.tasksRepository.findByWorkspace(workspace.id);
  }

  async findOne(userId: string, workspaceSlug: string, taskId: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    return task;
  }

  async update(
    userId: string,
    workspaceSlug: string,
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    if (dto.assigneeId) {
      await this.validateAssignee(workspace.id, dto.assigneeId);
    }

    const data = {
      ...(dto.title !== undefined && {
        title: dto.title.trim(),
      }),

      ...(dto.description !== undefined && {
        description: dto.description?.trim() || null,
      }),

      ...(dto.priority !== undefined && {
        priority: dto.priority,
      }),

      ...(dto.assigneeId !== undefined && {
        assigneeId: dto.assigneeId,
      }),

      ...(dto.dueDate !== undefined && {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      }),

      ...(dto.status !== undefined &&
        dto.status !== task.status && {
          status: dto.status,
        }),
    };

    return this.tasksRepository.update(taskId, data);
  }

  async move(
    userId: string,
    workspaceSlug: string,
    taskId: string,
    dto: MoveTaskDto,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    const targetPosition = Math.max(0, dto.position);

    if (task.status === dto.status) {
      if (targetPosition === task.position) {
        return task;
      }

      if (targetPosition < task.position) {
        await this.tasksRepository.shiftPositions(
          workspace.id,
          dto.status,
          targetPosition,
          task.id,
        );
      } else {
        await this.tasksRepository.shiftPositionsAfterRemoval(
          workspace.id,
          task.status,
          task.position,
          task.id,
        );

        const refreshedPosition = Math.max(0, targetPosition - 1);

        await this.tasksRepository.shiftPositions(
          workspace.id,
          dto.status,
          refreshedPosition,
          task.id,
        );

        return this.tasksRepository.update(task.id, {
          status: dto.status,
          position: refreshedPosition,
        });
      }

      return this.tasksRepository.update(task.id, {
        position: targetPosition,
      });
    }

    await this.tasksRepository.shiftPositionsAfterRemoval(
      workspace.id,
      task.status,
      task.position,
      task.id,
    );

    await this.tasksRepository.shiftPositions(
      workspace.id,
      dto.status,
      targetPosition,
      task.id,
    );

    return this.tasksRepository.update(task.id, {
      status: dto.status,
      position: targetPosition,
    });
  }
  async findMyTasks(userId: string, workspaceSlug: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    return this.tasksRepository.findByAssignee(workspace.id, userId);
  }
  
  async remove(userId: string, workspaceSlug: string, taskId: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    await this.tasksRepository.shiftPositionsAfterRemoval(
      workspace.id,
      task.status,
      task.position,
      task.id,
    );

    await this.tasksRepository.delete(task.id);

    return {
      id: task.id,
    };
  }
  private async validateAssignee(workspaceId: string, userId: string) {
    const isMember = await this.workspaceService.isMember(workspaceId, userId);

    if (!isMember) {
      throw new BadRequestException(
        'Assignee is not a member of this workspace.',
      );
    }
  }
}
