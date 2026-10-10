import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class TaskCommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTask(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async create(taskId: string, authorId: string, content: string) {
    return this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }
}