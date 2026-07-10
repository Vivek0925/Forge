import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';

import { WorkspaceRepository } from '../repositories/workspace.repository';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from '../dto/create-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceRepository: WorkspaceRepository) {}

  async create(ownerId: string, dto: CreateWorkspaceDto) {
    const slug = this.generateSlug(dto.name);

    const existingWorkspace = await this.workspaceRepository.findBySlug(slug);

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

  async update(ownerId: string, workspaceId: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepository.findById(workspaceId);

    if (!workspace || workspace.ownerId !== ownerId) {
      throw new NotFoundException('Workspace not found.');
    }

    const slug = this.generateSlug(dto.name);
    const existingWorkspace = await this.workspaceRepository.findBySlug(slug);

    if (existingWorkspace && existingWorkspace.id !== workspaceId) {
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
    const workspace = await this.workspaceRepository.findById(workspaceId);

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
