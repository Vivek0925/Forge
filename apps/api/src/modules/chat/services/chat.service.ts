import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkspaceService } from '../../workspace/services/workspace.service';
import { MessageRepository } from '../repositories/message.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { EditMessageDto } from '../dto/edit-message.dto';
import { ReactMessageDto } from '../dto/react-message.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly messageRepository: MessageRepository,
  ) {}

  async createMessage(senderId: string, dto: SendMessageDto) {
    const workspace = await this.workspaceService.findWorkspaceBySlug(
      dto.workspaceSlug,
    );

    return this.messageRepository.create({
      content: dto.content,
      workspaceId: workspace.id,
      senderId,
      attachments: dto.attachments,
      replyToId: dto.replyToId,
    });
  }

  async getWorkspaceMessages(workspaceSlug: string) {
    const workspace =
      await this.workspaceService.findWorkspaceBySlug(workspaceSlug);

    return this.messageRepository.findWorkspaceMessages(workspace.id);
  }

  async editMessage(senderId: string, dto: EditMessageDto) {
    const message = await this.messageRepository.updateOwnedMessage(
      dto.messageId,
      senderId,
      dto.content,
    );

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    return message;
  }

  async deleteMessage(senderId: string, messageId: string) {
    const message = await this.messageRepository.deleteOwnedMessage(
      messageId,
      senderId,
    );

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    return message;
  }

  async reactToMessage(userId: string, dto: ReactMessageDto) {
    return this.messageRepository.toggleReaction(
      dto.messageId,
      userId,
      dto.emoji,
    );
  }
}
