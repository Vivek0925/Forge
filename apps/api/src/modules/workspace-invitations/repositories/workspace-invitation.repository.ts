import { Injectable } from "@nestjs/common";
import { WorkspaceRole, InvitationStatus } from "@prisma/client";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class WorkspaceInvitationRepository {
    [x: string]: any;
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    workspaceId: string;
    invitedById: string;
    role: WorkspaceRole;
    token: string;
    expiresAt: Date;
  }) {
    return this.prisma.workspaceInvitation.create({
      data,
    });
  }

  async findPendingByEmail(
    workspaceId: string,
    email: string,
  ) {
    return this.prisma.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        email,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async findPendingForUser(email: string) {
  return this.prisma.workspaceInvitation.findMany({
    where: {
      email,
      status: InvitationStatus.PENDING,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      },
      invitedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


  async findByToken(token: string) {
    return this.prisma.workspaceInvitation.findUnique({
      where: {
        token,
      },
    });
  }

  async findById(id: string) {
  return this.prisma.workspaceInvitation.findUnique({
    where: { id },
  });
}

  async updateStatus(
    id: string,
    status: InvitationStatus,
  ) {
    return this.prisma.workspaceInvitation.update({
      where: { id },
      data: { status },
    });
  }
}