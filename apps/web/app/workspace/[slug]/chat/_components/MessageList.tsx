import type { Message } from "@/types/chats";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({
  messages,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="space-y-6">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
          />
        ))}
      </div>
    </div>
  );
}