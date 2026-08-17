import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class MeetingRepository {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(data: {
    title: string;
    description?: string;
    scheduledAt?: Date;
    startedAt?: Date;
    status: "SCHEDULED" | "ACTIVE";
    workspaceId: string;
    createdById: string;
  }) {
    return this.prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        startedAt: data.startedAt,
        status: data.status,
        workspaceId: data.workspaceId,
        createdById: data.createdById,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  findById(id: string) {
    return this.prisma.meeting.findUnique({
      where: {
        id,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  findByWorkspace(workspaceId: string) {
    return this.prisma.meeting.findMany({
      where: {
        workspaceId,

        /*
         * The Meetings page only shows:
         *
         * ACTIVE    → currently live
         * SCHEDULED → upcoming
         *
         * ENDED meetings remain in PostgreSQL
         * but are intentionally not returned here.
         */
        status: {
          in: ["ACTIVE", "SCHEDULED"],
        },
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },

      orderBy: [
        {
          status: "asc",
        },
        {
          scheduledAt: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  }

  start(id: string) {
    return this.prisma.meeting.update({
      where: {
        id,
      },

      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        endedAt: null,
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  end(id: string) {
    return this.prisma.meeting.update({
      where: {
        id,
      },

      data: {
        status: "ENDED",
        endedAt: new Date(),
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },

        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async join(
    meetingId: string,
    userId: string,
  ) {
    return this.prisma.meetingParticipant.upsert({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },

      create: {
        meetingId,
        userId,
        joinedAt: new Date(),
      },

      update: {
        joinedAt: new Date(),
        leftAt: null,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async leave(
    meetingId: string,
    userId: string,
  ) {
    return this.prisma.meetingParticipant.update({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },

      data: {
        leftAt: new Date(),
      },
    });
  }
}