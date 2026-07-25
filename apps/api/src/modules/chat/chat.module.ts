@Module({
  imports: [
    WorkspaceModule,
  ],
  providers: [
    ChatService,
    MessageRepository,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}