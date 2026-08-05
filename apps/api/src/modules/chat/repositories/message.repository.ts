import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

interface CreateMessageInput {
  content: string;
  workspaceId: string;
  senderId: string;

  replyToId?: string;

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
  constructor(private readonly prisma: PrismaService) {}

  create({
    content,
    workspaceId,
    senderId,
    replyToId,
    attachments = [],
  }: CreateMessageInput) {
    return this.prisma.message.create({
      data: {
        content,

        workspace: {
          connect: {
            id: workspaceId,
          },
        },

        sender: {
          connect: {
            id: senderId,
          },
        },

        replyTo: replyToId
          ? {
              connect: {
                id: replyToId,
              },
            }
          : undefined,

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

        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
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

        attachments: true,

        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
