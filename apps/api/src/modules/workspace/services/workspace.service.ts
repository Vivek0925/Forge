import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { WorkspaceRepository } from '../repositories/workspace.repository';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '../dto/create-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    const slug = this.generateSlug(dto.name);

    const existingWorkspace =
      await this.workspaceRepository.findBySlug(slug);

    if (existingWorkspace) {
      throw new BadRequestException(
        'A workspace with this name already exists.',
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

  /**
   * Used internally by other modules
   * (Chat, Meetings, AI, Files, etc.)
   */
  async findWorkspaceBySlug(slug: string) {
    const workspace =
      await this.workspaceRepository.findBySlug(slug);

    if (!workspace) {
      throw new NotFoundException('Workspace not found.');
    }

    return workspace;
  }

  /**
   * Used by workspace REST endpoints.
   * Ensures the requester owns the workspace.
   */
  async findBySlug(ownerId: string, slug: string) {
    const workspace = await this.findWorkspaceBySlug(slug);

    if (workspace.ownerId !== ownerId) {
      throw new NotFoundException('Workspace not found.');
    }

    return workspace;
  }

  async update(
    ownerId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ) {
    const workspace =
      await this.workspaceRepository.findById(workspaceId);

    if (!workspace || workspace.ownerId !== ownerId) {
      throw new NotFoundException('Workspace not found.');
    }

    const slug = this.generateSlug(dto.name);

    const existingWorkspace =
      await this.workspaceRepository.findBySlug(slug);

    if (
      existingWorkspace &&
      existingWorkspace.id !== workspaceId
    ) {
      throw new BadRequestException(
        'A workspace with this name already exists.',
      );
    }

    return this.workspaceRepository.update(workspaceId, {
      name: dto.name,
      slug,
    });
  }

  async delete(ownerId: string, workspaceId: string) {
    const workspace =
      await this.workspaceRepository.findById(workspaceId);

    if (!workspace || workspace.ownerId !== ownerId) {
      throw new NotFoundException('Workspace not found.');
    }

    return this.workspaceRepository.delete(workspaceId);
  }

  private generateSlug(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}