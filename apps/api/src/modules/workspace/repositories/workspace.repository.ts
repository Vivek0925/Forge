import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { WorkspaceRole } from '@prisma/client/wasm';

@Injectable()
export class WorkspaceRepository {
  
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }) {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: {
            userId: data.ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.workspace.findUnique({
      where: { slug },
    });
  }

  async findById(id: string) {
    return this.prisma.workspace.findUnique({
      where: { id },
    });
  }

 async findUserWorkspaces(userId: string) {
  return this.prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async findMember(workspaceId: string, userId: string) {
  return this.prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

async findMemberByEmail(
  workspaceId: string,
  email: string,
) {
  return this.prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      user: {
        email,
      },
    },
    include: {
      user: true,
    },
  });
}

async addMember(data: {
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}) {
  return this.prisma.workspaceMember.create({
    data,
  });
}

  async update(id: string, data: { name: string; slug: string }) {
    return this.prisma.workspace.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}


