import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { WorkspaceService } from "../../workspace/services/workspace.service";
import { TaskListsRepository } from "../repositories/task-lists.repository";

@Injectable()
export class TaskListsService {
  constructor(
    private readonly taskListsRepository: TaskListsRepository,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async findAll(userId: string, workspaceSlug: string) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    return this.taskListsRepository.findByWorkspace(workspace.id);
  }

  async create(
    userId: string,
    workspaceSlug: string,
    name: string,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new BadRequestException("List name is required.");
    }

    if (trimmedName.length > 100) {
      throw new BadRequestException(
        "List name must be 100 characters or fewer.",
      );
    }

    const position =
      await this.taskListsRepository.getNextPosition(workspace.id);

    return this.taskListsRepository.create({
      workspaceId: workspace.id,
      name: trimmedName,
      position,
      createdById: userId,
    });
  }

  async update(
    userId: string,
    workspaceSlug: string,
    listId: string,
    name: string,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const list = await this.taskListsRepository.findById(listId);

    if (!list || list.workspaceId !== workspace.id) {
      throw new NotFoundException("List not found.");
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new BadRequestException("List name is required.");
    }

    if (trimmedName.length > 100) {
      throw new BadRequestException(
        "List name must be 100 characters or fewer.",
      );
    }

    return this.taskListsRepository.update(listId, {
      name: trimmedName,
    });
  }

  async move(
    userId: string,
    workspaceSlug: string,
    listId: string,
    position: number,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const list = await this.taskListsRepository.findById(listId);

    if (!list || list.workspaceId !== workspace.id) {
      throw new NotFoundException("List not found.");
    }

    const targetPosition = Math.max(0, position);

    if (targetPosition === list.position) {
      return list;
    }

    if (targetPosition < list.position) {
      await this.taskListsRepository.shiftPositions(
        workspace.id,
        targetPosition,
        list.id,
      );
    } else {
      await this.taskListsRepository.shiftPositionsAfterRemoval(
        workspace.id,
        list.position,
        list.id,
      );

      const refreshedPosition = Math.max(0, targetPosition - 1);

      await this.taskListsRepository.shiftPositions(
        workspace.id,
        refreshedPosition,
        list.id,
      );

      return this.taskListsRepository.update(list.id, {
        position: refreshedPosition,
      });
    }

    return this.taskListsRepository.update(list.id, {
      position: targetPosition,
    });
  }

  async remove(
    userId: string,
    workspaceSlug: string,
    listId: string,
  ) {
    const workspace =
      await this.workspaceService.findAccessibleWorkspace(
        userId,
        workspaceSlug,
      );

    const list = await this.taskListsRepository.findById(listId);

    if (!list || list.workspaceId !== workspace.id) {
      throw new NotFoundException("List not found.");
    }

    await this.taskListsRepository.shiftPositionsAfterRemoval(
      workspace.id,
      list.position,
      list.id,
    );

    await this.taskListsRepository.delete(list.id);

    return { id: list.id };
  }
}