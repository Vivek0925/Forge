"use client";

import { useState, KeyboardEvent } from "react";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({
  onSend,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const content = message.trim();

    if (!content) return;

    onSend(content);

    setMessage("");
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-[#ECEEF3] bg-[#FAFAFB] px-6 py-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end gap-3 rounded-3xl border border-[#DEDFE8] bg-white px-4 py-2 shadow-sm transition-all focus-within:border-[#BEEAD7] focus-within:shadow-md">
          <button
            type="button"
            className="rounded-xl p-2 text-[#7C8093] transition hover:bg-[#F5F6F8]"
          >
            <Paperclip size={18} />
          </button>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Message this workspace..."
            className="max-h-40 flex-1 resize-none bg-transparent text-[15px] leading-6 text-[#23262F] placeholder:text-[#9CA3AF] outline-none"
          />

          <button
            type="button"
            className="rounded-xl p-2 text-[#7C8093] transition hover:bg-[#F5F6F8]"
          >
            <Smile size={18} />
          </button>

          <button
            type="button"
            onClick={sendMessage}
            disabled={!message.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F8EF] text-[#1E8E5A] transition hover:bg-[#D8F3E5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}