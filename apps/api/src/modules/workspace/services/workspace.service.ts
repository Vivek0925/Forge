import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import { WorkspaceRepository } from "../repositories/workspace.repository";
import { CreateWorkspaceDto } from "../dto/create-workspace.dto";

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async create(
    ownerId: string,
    dto: CreateWorkspaceDto,
  ) {
    const slug = this.generateSlug(dto.name);

    const existingWorkspace =
      await this.workspaceRepository.findBySlug(slug);

    if (existingWorkspace) {
      throw new BadRequestException(
        "A workspace with this name already exists.",
      );
    }

    return this.workspaceRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      ownerId,
    });
  }

  async findMyWorkspaces(ownerId: string) {
    return this.workspaceRepository.findByOwner(ownerId);
  }

  private generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
}