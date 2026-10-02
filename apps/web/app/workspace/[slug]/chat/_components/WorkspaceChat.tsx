"use client";

import { useState } from "react";

import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

import { useChat } from "@/hooks/useChat";

import type { Message } from "@/types/chats";

interface WorkspaceChatProps {
  slug: string;
}

export default function WorkspaceChat({ slug }: WorkspaceChatProps) {
  const {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
  } = useChat(slug);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#DEDFE8] bg-white shadow-[0_18px_50px_rgba(20,20,28,0.06)] sm:rounded-[32px]">
      {/* Header */}
      <div className="border-b border-[#ECEEF3] px-4 py-2.5 sm:px-5 sm:py-3">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#20232D] sm:text-[26px]">
          Workspace Chat
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[#707487]">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F7F5] sm:mb-6 sm:h-20 sm:w-20">
              💬
            </div>

            <h2 className="text-lg font-semibold text-[#20232D] sm:text-[22px]">
              No conversations yet
            </h2>

            <p className="mt-2 max-w-md px-4 text-center text-[13px] leading-6 text-[#707487] sm:mt-3 sm:px-0 sm:text-[15px] sm:leading-7">
              Start collaborating with everyone in this workspace.
            </p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            onReply={setReplyingTo}
            onEdit={(message) => editMessage(message.id, message.content)}
            onDelete={(message) => deleteMessage(message.id)}
            onReact={(message, emoji) => reactToMessage(message.id, emoji)}
          />
        )}
      </div>

      <MessageInput
        workspaceSlug={slug}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSend={(content, attachments, replyToId) => {
          sendMessage(content, attachments, replyToId);

          setReplyingTo(null);
        }}
      />
    </div>
  );
}
