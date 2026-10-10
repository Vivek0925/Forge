import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceService } from '../../workspace/services/workspace.service';

import { CreateTaskDto } from '../dto/create-task.dto';
import { MoveTaskDto } from '../dto/move-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

import { TaskListsRepository } from '../repositories/task-lists.repository';
import { TasksRepository } from '../repositories/tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly taskListsRepository: TaskListsRepository,
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

    const list = await this.taskListsRepository.findById(dto.listId);

    if (!list || list.workspaceId !== workspace.id) {
      throw new BadRequestException('Invalid task list.');
    }

    const position = await this.tasksRepository.getNextPosition(
      workspace.id,
      list.id,
    );

    return this.tasksRepository.create({
      workspaceId: workspace.id,
      listId: list.id,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      priority: dto.priority,
      assigneeId: dto.assigneeId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
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

  async findOne(
    userId: string,
    workspaceSlug: string,
    taskId: string,
  ) {
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

    await this.assertCanManageTask(workspace.id, userId, task);

    if (dto.assigneeId) {
      await this.validateAssignee(workspace.id, dto.assigneeId);
    }

    if (dto.listId !== undefined) {
      const list = await this.taskListsRepository.findById(dto.listId);

      if (!list || list.workspaceId !== workspace.id) {
        throw new BadRequestException('Invalid task list.');
      }
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

      ...(dto.listId !== undefined && {
        listId: dto.listId,
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

    await this.assertCanManageTask(workspace.id, userId, task);

    const targetList = await this.taskListsRepository.findById(
      dto.listId,
    );

    if (!targetList || targetList.workspaceId !== workspace.id) {
      throw new BadRequestException('Invalid task list.');
    }

    const targetPosition = Math.max(0, dto.position);

    // Same list
    if (task.listId === targetList.id) {
      if (targetPosition === task.position) {
        return task;
      }

      if (targetPosition < task.position) {
        await this.tasksRepository.shiftPositions(
          workspace.id,
          targetList.id,
          targetPosition,
          task.id,
        );

        return this.tasksRepository.update(task.id, {
          position: targetPosition,
        });
      }

      await this.tasksRepository.shiftPositionsAfterRemoval(
        workspace.id,
        task.listId,
        task.position,
        task.id,
      );

      const refreshedPosition = Math.max(0, targetPosition - 1);

      await this.tasksRepository.shiftPositions(
        workspace.id,
        targetList.id,
        refreshedPosition,
        task.id,
      );

      return this.tasksRepository.update(task.id, {
        position: refreshedPosition,
      });
    }

    // Moving to another list:
    // First close the gap in the old list.
    await this.tasksRepository.shiftPositionsAfterRemoval(
      workspace.id,
      task.listId,
      task.position,
      task.id,
    );

    // Then make room in the target list.
    await this.tasksRepository.shiftPositions(
      workspace.id,
      targetList.id,
      targetPosition,
      task.id,
    );

    return this.tasksRepository.update(task.id, {
      listId: targetList.id,
      position: targetPosition,
    });
  }

  async findMyTasks(userId: string, workspaceSlug: string) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    return this.tasksRepository.findByAssignee(
      workspace.id,
      userId,
    );
  }

  async remove(
    userId: string,
    workspaceSlug: string,
    taskId: string,
  ) {
    const workspace = await this.workspaceService.findAccessibleWorkspace(
      userId,
      workspaceSlug,
    );

    const task = await this.tasksRepository.findById(taskId);

    if (!task || task.workspaceId !== workspace.id) {
      throw new NotFoundException('Task not found.');
    }

    await this.assertCanManageTask(workspace.id, userId, task);

    await this.tasksRepository.shiftPositionsAfterRemoval(
      workspace.id,
      task.listId,
      task.position,
      task.id,
    );

    await this.tasksRepository.delete(task.id);

    return {
      id: task.id,
    };
  }

  private async assertCanManageTask(
  workspaceId: string,
  userId: string,
  task: {
    createdById: string;
    assigneeId: string | null;
  },
): Promise<void> {
  const isAdminOrOwner =
    await this.workspaceService.isWorkspaceAdminOrOwner(
      workspaceId,
      userId,
    );

  const isCreator = task.createdById === userId;
  const isAssignee = task.assigneeId === userId;

  if (!isAdminOrOwner && !isCreator && !isAssignee) {
    throw new ForbiddenException(
      "You don't have permission to modify this task.",
    );
  }
}

  private async validateAssignee(
    workspaceId: string,
    userId: string,
  ) {
    const isMember = await this.workspaceService.isMember(
      workspaceId,
      userId,
    );

    if (!isMember) {
      throw new BadRequestException(
        'Assignee is not a member of this workspace.',
      );
    }
  }
}