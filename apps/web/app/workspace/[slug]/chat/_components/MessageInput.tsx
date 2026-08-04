"use client";

import {
  useState,
  useRef,
  KeyboardEvent,
  ChangeEvent,
} from "react";

import {
  Paperclip,
  SendHorizontal,
  Smile,
  X,
  Loader2,
} from "lucide-react";

import { uploadFile } from "@/lib/storage";

interface UploadedAttachment {
  fileName: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

interface MessageInputProps {
  onSend: (
    content: string,
    attachments?: UploadedAttachment[],
  ) => void;
}

export default function MessageInput({
  onSend,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const [attachments, setAttachments] = useState<
    UploadedAttachment[]
  >([]);

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  async function handleFileUpload(
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const uploaded =
        await uploadFile(file);

      setAttachments((prev) => [
        ...prev,
        uploaded,
      ]);
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
    setAttachments((prev) =>
      prev.filter((_, i) => i !== index),
    );
  }

  const sendMessage = () => {
    const content = message.trim();

    if (
      !content &&
      attachments.length === 0
    ) {
      return;
    }

    onSend(content, attachments);

    setMessage("");
    setAttachments([]);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-[#ECEEF3] bg-[#FAFAFB] px-6 py-4">
      <div className="mx-auto max-w-5xl">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileUpload}
        />

        {attachments.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {attachments.map(
              (attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-xl border border-[#E6E8EF] bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-sm">
                    📎 {attachment.fileName}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeAttachment(index)
                    }
                  >
                    <X
                      size={15}
                      className="text-zinc-500 hover:text-red-500"
                    />
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        <div className="flex items-end gap-3 rounded-3xl border border-[#DEDFE8] bg-white px-4 py-2 shadow-sm transition-all focus-within:border-[#BEEAD7] focus-within:shadow-md">
          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
            className="rounded-xl p-2 text-[#7C8093] transition hover:bg-[#F5F6F8]"
          >
            {uploading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Paperclip size={18} />
            )}
          </button>

          <textarea
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
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
            disabled={
              uploading ||
              (!message.trim() &&
                attachments.length === 0)
            }
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F8EF] text-[#1E8E5A] transition hover:bg-[#D8F3E5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}