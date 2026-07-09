import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

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
            role: "OWNER",
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

  async findByOwner(ownerId: string) {
    return this.prisma.workspace.findMany({
      where: { ownerId },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}