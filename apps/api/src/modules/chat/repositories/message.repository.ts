import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    content: string;
    workspaceId: string;
    senderId: string;
  }) {
    return this.prisma.message.create({
      data,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  findWorkspaceMessages(workspaceId: string) {
    return this.prisma.message.findMany({
      where: {
        workspaceId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }
}