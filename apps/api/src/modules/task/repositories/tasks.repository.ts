import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TaskUncheckedCreateInput) {
    return this.prisma.task.create({
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.task.findMany({
      where: { workspaceId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }

  async getNextPosition(workspaceId: string, listId: string) {
    const lastTask = await this.prisma.task.findFirst({
      where: {
        workspaceId,
        listId,
      },
      orderBy: {
        position: "desc",
      },
      select: {
        position: true,
      },
    });

    return lastTask ? lastTask.position + 1 : 0;
  }

  async shiftPositions(
    workspaceId: string,
    listId: string,
    position: number,
    excludeTaskId?: string,
  ) {
    return this.prisma.task.updateMany({
      where: {
        workspaceId,
        listId,
        position: {
          gte: position,
        },
        ...(excludeTaskId
          ? {
              id: {
                not: excludeTaskId,
              },
            }
          : {}),
      },
      data: {
        position: {
          increment: 1,
        },
      },
    });
  }

  async shiftPositionsAfterRemoval(
    workspaceId: string,
    listId: string,
    position: number,
    excludeTaskId: string,
  ) {
    return this.prisma.task.updateMany({
      where: {
        workspaceId,
        listId,
        position: {
          gt: position,
        },
        id: {
          not: excludeTaskId,
        },
      },
      data: {
        position: {
          decrement: 1,
        },
      },
    });
  }

  async findByAssignee(
    workspaceId: string,
    assigneeId: string,
  ) {
    return this.prisma.task.findMany({
      where: {
        workspaceId,
        assigneeId,
      },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        list: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });
  }
}