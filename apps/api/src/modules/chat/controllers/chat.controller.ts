import { Controller, Get, Param, UseGuards } from "@nestjs/common";

import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ChatService } from "../services/chat.service";

@Controller("workspaces/:slug/messages")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @Get()
  async getWorkspaceMessages(
    @Param("slug") slug: string,
  ) {
    return this.chatService.getWorkspaceMessages(slug);
  }
}