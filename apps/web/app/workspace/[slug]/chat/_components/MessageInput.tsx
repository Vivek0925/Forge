"use client";

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";

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
  workspaceSlug: string;

  replyingTo: Message | null;

  onCancelReply: () => void;

  onSend: (
    content: string,
    attachments?: UploadedAttachment[],
    replyToId?: string,
  ) => void;
}

export default function MessageInput({
  workspaceSlug,
  replyingTo,
  onCancelReply,
  onSend,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);

  const [uploading, setUploading] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [fileAccept, setFileAccept] = useState<string | undefined>();
  const [captureCamera, setCaptureCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeAttachmentMenu(event: MouseEvent) {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(event.target as Node)
      ) {
        setAttachmentMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeAttachmentMenu);
    return () =>
      document.removeEventListener("mousedown", closeAttachmentMenu);
  }, []);

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const uploaded = (await uploadFile(
        file,
        workspaceSlug,
      )) as UploadedAttachment;

      setAttachments((prev) => [...prev, uploaded]);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload file.",
      );
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

  function openFilePicker(
    accept?: string,
    capture?: boolean,
  ) {
    setFileAccept(accept);
    setCaptureCamera(Boolean(capture));
    setAttachmentMenuOpen(false);
    requestAnimationFrame(() => fileInputRef.current?.click());
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
          accept={fileAccept}
          capture={captureCamera ? "environment" : undefined}
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
                {attachment.mimeType.startsWith("image/") ? (
                  <img
                    src={attachment.url}
                    alt={attachment.fileName}
                    className="h-10 w-10 rounded-lg border border-[#E6E8EF] object-cover"
                  />
                ) : (
                  <span className="text-sm">📎</span>
                )}

                <span className="max-w-[180px] truncate">
                  {attachment.fileName}
                </span>

                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  aria-label={`Remove ${attachment.fileName}`}
                >
                  <X size={15} className="text-zinc-500 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-1.5 rounded-2xl border border-[#DEDFE8] bg-white px-2 py-1.5 shadow-sm transition-all focus-within:border-[#BEEAD7] focus-within:shadow-md sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-2">
          <div ref={attachmentMenuRef} className="relative">
            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                setAttachmentMenuOpen((open) => !open)
              }
              aria-label="Add attachment"
              aria-expanded={attachmentMenuOpen}
              className="rounded-lg p-1.5 text-[#7C8093] transition hover:bg-[#F5F6F8] sm:rounded-xl sm:p-2"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Paperclip size={16} />
              )}
            </button>

            {attachmentMenuOpen && (
              <div className="absolute bottom-12 left-0 z-20 w-52 rounded-2xl border border-[#2A2D35] bg-[#17191E] p-2 text-white shadow-xl">
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker(
                      ".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10"
                >
                  <span className="text-violet-400">▣</span>
                  Document
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker("image/*,video/*")
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10"
                >
                  <span className="text-blue-400">▣</span>
                  Photos &amp; videos
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openFilePicker("image/*", true)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-white/10"
                >
                  <span className="text-pink-400">●</span>
                  Camera
                </button>
              </div>
            )}
          </div>

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
