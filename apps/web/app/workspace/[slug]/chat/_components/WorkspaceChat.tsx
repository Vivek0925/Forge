"use client";

import { useChat } from "../_hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function WorkspaceChat() {
  const { messages } = useChat();

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={messages} />
      <MessageInput />
    </div>
  );
}