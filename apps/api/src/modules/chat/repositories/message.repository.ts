import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

interface CreateMessageInput {
  content: string;
  workspaceId: string;
  senderId: string;

  attachments?: {
    fileName: string;
    key: string;
    url: string;
    mimeType: string;
    size: number;
  }[];
}

@Injectable()
export class MessageRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create({
    content,
    workspaceId,
    senderId,
    attachments = [],
  }: CreateMessageInput) {
    return this.prisma.message.create({
      data: {
        content,
        workspaceId,
        senderId,

        attachments: {
          create: attachments.map((attachment) => ({
            fileName: attachment.fileName,
            key: attachment.key,
            url: attachment.url,
            mimeType: attachment.mimeType,
            size: attachment.size,
          })),
        },
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        attachments: true,
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

        attachments: true,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }
}