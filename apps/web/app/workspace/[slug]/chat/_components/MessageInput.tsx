"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";

import {
  Loader2,
  Paperclip,
  SendHorizontal,
  Smile,
  X,
  Reply,
} from "lucide-react";

import { uploadFile } from "@/lib/storage";
import type { Message } from "@/types/chats";

interface UploadedAttachment {
  fileName: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

interface MessageInputProps {
  replyingTo: Message | null;

  onCancelReply: () => void;

  onSend: (
    content: string,
    attachments?: UploadedAttachment[],
    replyToId?: string,
  ) => void;
}

export default function MessageInput({
  replyingTo,
  onCancelReply,
  onSend,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const uploaded = (await uploadFile(file)) as UploadedAttachment;

      setAttachments((prev) => [...prev, uploaded]);
    } catch (error) {
      console.error(error);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function sendMessage() {
    const content = message.trim();

    if (!content && attachments.length === 0) {
      return;
    }

    onSend(content, attachments, replyingTo?.id);

    setMessage("");
    setAttachments([]);

    onCancelReply();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="border-t border-[#ECEEF3] bg-[#FAFAFB] px-3 py-2.5 sm:px-6 sm:py-4">
      <div className="mx-auto max-w-5xl">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />

        {replyingTo && (
          <div className="mb-2 flex items-start justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 sm:mb-3 sm:rounded-2xl sm:px-4 sm:py-3">
            <div className="flex gap-2 sm:gap-3">
              <Reply size={16} className="mt-0.5 text-emerald-600" />

              <div>
                <p className="text-xs font-semibold text-emerald-700 sm:text-sm">
                  Replying to {replyingTo.sender.name}
                </p>

                <p className="mt-1 line-clamp-2 text-xs text-zinc-600 sm:text-sm">
                  {replyingTo.content || "Attachment"}
                </p>
              </div>
            </div>

            <button
              onClick={onCancelReply}
              className="rounded-lg p-1 hover:bg-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 sm:mb-4 sm:gap-3">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-xl border border-[#E6E8EF] bg-white px-2.5 py-1.5 text-xs shadow-sm sm:px-3 sm:py-2 sm:text-sm"
              >
                <span className="text-sm">📎 {attachment.fileName}</span>

                <button onClick={() => removeAttachment(index)}>
                  <X size={15} className="text-zinc-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-[#DEDFE8] bg-white px-2 py-1.5 shadow-sm transition-all focus-within:border-[#BEEAD7] focus-within:shadow-md sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-1.5 text-[#7C8093] transition hover:bg-[#F5F6F8] sm:rounded-xl sm:p-2"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Paperclip size={16} />
            )}
          </button>

          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message this workspace..."
            className="max-h-32 flex-1 resize-none bg-transparent text-[13px] leading-5 text-[#23262F] placeholder:text-[#9CA3AF] outline-none sm:max-h-40 sm:text-[15px] sm:leading-6"
          />

          <button className="rounded-lg p-1.5 text-[#7C8093] transition hover:bg-[#F5F6F8] sm:rounded-xl sm:p-2">
            <Smile size={16} />
          </button>

          <button
            onClick={sendMessage}
            disabled={
              uploading || (!message.trim() && attachments.length === 0)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E7F8EF] text-[#1E8E5A] transition hover:bg-[#D8F3E5] disabled:opacity-50 sm:h-10 sm:w-10 sm:rounded-2xl"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
