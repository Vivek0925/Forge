"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/context/AuthContext";

import type { Message } from "@/types/chats";

import MessageItem from "./MessageItem";
import DateSeparator from "../DateSeparator";

interface MessageListProps {
  messages: Message[];

  onReply: (message: Message) => void;
}

export default function MessageList({
  messages,
  onReply,
}: MessageListProps) {
  const { user } = useAuth();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto px-8 py-6">
      <div className="space-y-2">
        {messages.map((message, index) => {
          const previous = messages[index - 1];

          const currentDate = new Date(
            message.createdAt,
          ).toDateString();

          const previousDate = previous
            ? new Date(
                previous.createdAt,
              ).toDateString()
            : null;

          const showDate =
            currentDate !== previousDate;

          return (
            <div key={message.id}>
              {showDate && (
                <DateSeparator
                  date={message.createdAt}
                />
              )}

              <MessageItem
                message={message}
                previousMessage={previous}
                currentUserId={user?.id}
                onReply={onReply}
              />
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}