import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class TaskListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TaskListUncheckedCreateInput) {
    return this.prisma.taskList.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.taskList.findMany({
      where: { workspaceId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        tasks: {
          orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
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
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.taskList.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Prisma.TaskListUpdateInput) {
    return this.prisma.taskList.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.taskList.delete({
      where: { id },
    });
  }

  async getNextPosition(workspaceId: string) {
    const lastList = await this.prisma.taskList.findFirst({
      where: { workspaceId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return lastList ? lastList.position + 1 : 0;
  }

  async shiftPositions(
    workspaceId: string,
    position: number,
    excludeListId?: string,
  ) {
    return this.prisma.taskList.updateMany({
      where: {
        workspaceId,
        position: { gte: position },
        ...(excludeListId
          ? {
              id: { not: excludeListId },
            }
          : {}),
      },
      data: {
        position: { increment: 1 },
      },
    });
  }

  async shiftPositionsAfterRemoval(
    workspaceId: string,
    position: number,
    excludeListId: string,
  ) {
    return this.prisma.taskList.updateMany({
      where: {
        workspaceId,
        position: { gt: position },
        id: { not: excludeListId },
      },
      data: {
        position: { decrement: 1 },
      },
    });
  }
}