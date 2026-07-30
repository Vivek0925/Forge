"use client";

import MessageInput from "./MessageInput";
import MessageList from "./MessageList";

import { useChat } from "@/hooks/useChat";

interface WorkspaceChatProps {
  slug: string;
}

export default function WorkspaceChat({
  slug,
}: WorkspaceChatProps) {
  const {
    messages,
    loading,
    sendMessage,
  } = useChat(slug);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-[#DEDFE8] bg-white shadow-[0_18px_50px_rgba(20,20,28,0.06)]">
      {/* Header */}
      <div className="border-b border-[#ECEEF3] px-5 py-3">
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-[#20232D]">
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
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F7F5]">
              💬
            </div>

            <h2 className="text-[22px] font-semibold text-[#20232D]">
              No conversations yet
            </h2>

            <p className="mt-3 max-w-md text-center text-[15px] leading-7 text-[#707487]">
              Start collaborating with everyone in this workspace.
            </p>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  );
}