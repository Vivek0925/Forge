import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../../auth/interfaces/current-user.interface';
import { ChatService } from '../services/chat.service';

@Controller('workspaces/:slug/messages')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getWorkspaceMessages(
    @Param('slug') slug: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.chatService.getWorkspaceMessages(user.id, slug);
  }
}
