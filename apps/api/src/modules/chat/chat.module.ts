import { Module } from "@nestjs/common";

import { WorkspaceModule } from "../workspace/workspace.module";

import { ChatService } from "./services/chat.service";
import { MessageRepository } from "./repositories/message.repository";

@Module({
  imports: [WorkspaceModule],
  providers: [
    ChatService,
    MessageRepository,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}