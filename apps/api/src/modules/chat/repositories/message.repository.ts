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

  async updateOwnedMessage(
    messageId: string,
    senderId: string,
    content: string,
  ) {
    const ownedMessage = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId,
      },
    });

    if (!ownedMessage) {
      return null;
    }

    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        content,
        edited: true,
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

  async deleteOwnedMessage(messageId: string, senderId: string) {
    const ownedMessage = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        senderId,
      },
    });

    if (!ownedMessage) {
      return null;
    }

    return this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    const message = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
    });

    const reactions =
      message.reactions && typeof message.reactions === 'object'
        ? (message.reactions as Record<string, string[]>)
        : {};

    const users = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];

    reactions[emoji] = users.includes(userId)
      ? users.filter((id) => id !== userId)
      : [...users, userId];

    if (reactions[emoji].length === 0) {
      delete reactions[emoji];
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { reactions },
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
}
