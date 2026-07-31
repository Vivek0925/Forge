"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";

import type { Message } from "@/types/chats";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  const { user } = useAuth();

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
            currentUserId={user?.id}
          />
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
