import { Injectable } from "@nestjs/common";

import { WorkspaceService } from "../../workspace/services/workspace.service";
import { MessageRepository } from "../repositories/message.repository";
import { SendMessageDto } from "../dto/send-message.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly messageRepository: MessageRepository,
  ) {}

  async createMessage(
    senderId: string,
    dto: SendMessageDto,
  ) {
    const workspace =
      await this.workspaceService.findWorkspaceBySlug(
        dto.workspaceSlug,
      );

    return this.messageRepository.create({
      content: dto.content,
      workspaceId: workspace.id,
      senderId,
      attachments: dto.attachments,
    });
  }

  async getWorkspaceMessages(
    workspaceSlug: string,
  ) {
    const workspace =
      await this.workspaceService.findWorkspaceBySlug(
        workspaceSlug,
      );

    return this.messageRepository.findWorkspaceMessages(
      workspace.id,
    );
  }
}