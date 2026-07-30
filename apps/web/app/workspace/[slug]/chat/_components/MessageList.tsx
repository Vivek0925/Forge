"use client";

import { useEffect, useRef } from "react";

import type { Message } from "@/types/chats";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({
  messages,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <div className="space-y-8">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}