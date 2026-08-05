import clsx from "clsx";
import { Reply } from "lucide-react";
import type { Message } from "@/types/chats";

interface MessageItemProps {
  message: Message;
  previousMessage?: Message;
  currentUserId?: string;
  onReply: (message: Message) => void;
}

export default function MessageItem({
  message,
  previousMessage,
  currentUserId,
  onReply,
}: MessageItemProps) {
  const isMine = message.sender.id === currentUserId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const shouldGroup =
    previousMessage &&
    previousMessage.sender.id === message.sender.id &&
    new Date(previousMessage.createdAt).toDateString() ===
      new Date(message.createdAt).toDateString() &&
    new Date(message.createdAt).getTime() -
      new Date(previousMessage.createdAt).getTime() <
      5 * 60 * 1000;

  return (
    <div
      className={clsx(
        "flex",
        isMine ? "justify-end" : "justify-start",
        shouldGroup ? "mt-1" : "mt-6",
      )}
    >
      <div
        className={clsx(
          "flex max-w-[70%] flex-col",
          isMine ? "items-end" : "items-start",
        )}
      >
        {!isMine && !shouldGroup && (
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#20232D]">
                {message.sender.name}
              </h3>

              <span className="text-xs text-zinc-400">{time}</span>

              {message.edited && (
                <span className="text-xs text-zinc-400">edited</span>
              )}
            </div>
          </div>
        )}

        <div className="group relative">
          <button
            onClick={() => onReply(message)}
            className={clsx(
              "absolute bottom-2 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-md transition-all",
              "opacity-0 group-hover:opacity-100 hover:bg-zinc-100",
              isMine ? "-left-10" : "-right-10",
            )}
            title="Reply"
          >
            <Reply size={15} />
          </button>

          <div
            className={clsx(
              "rounded-2xl px-4 py-1.5 transition-colors",
              isMine
                ? "bg-[#20232D] text-white"
                : "border border-zinc-200 bg-white text-zinc-700",
              shouldGroup &&
                (isMine
                  ? "rounded-tr-2xl rounded-br-md"
                  : "rounded-tl-2xl rounded-bl-md"),
            )}
          >
            {message.replyTo && (
              <div
                className={clsx(
                  "mb-3 rounded-lg border-l-4 px-3 py-1",
                  isMine
                    ? "border-white/40 bg-white/10"
                    : "border-emerald-500 bg-zinc-100",
                )}
              >
                <p className="text-xs font-semibold">
                  {message.replyTo.sender.name}
                </p>

                <p className="mt-1 line-clamp-2 text-xs opacity-80">
                  {message.replyTo.content || "Attachment"}
                </p>
              </div>
            )}

            {/* Attachments */}

            {message.attachments?.length > 0 && (
              <div className="mb-3 space-y-3">
                {message.attachments.map((attachment, index) => {
                  const isImage = attachment.mimeType.startsWith("image/");

                  const isVideo = attachment.mimeType.startsWith("video/");

                  const isPdf = attachment.mimeType === "application/pdf";

                  if (isImage) {
                    return (
                      <img
                        key={attachment.id ?? index}
                        src={attachment.url}
                        alt={attachment.fileName}
                        className="max-h-80 w-full rounded-xl border object-cover"
                      />
                    );
                  }

                  if (isVideo) {
                    return (
                      <video
                        key={attachment.id ?? index}
                        controls
                        className="max-h-80 w-full rounded-xl border"
                      >
                        <source
                          src={attachment.url}
                          type={attachment.mimeType}
                        />
                      </video>
                    );
                  }

                  if (isPdf) {
                    return (
                      <a
                        key={attachment.id ?? index}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl border bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100"
                      >
                        📄
                        <div>
                          <p className="font-medium">{attachment.fileName}</p>

                          <p className="text-xs opacity-70">PDF Document</p>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <a
                      key={attachment.id ?? index}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100"
                    >
                      📎
                      <div>
                        <p className="font-medium">{attachment.fileName}</p>

                        <p className="text-xs opacity-70">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {message.content && (
              <p className="whitespace-pre-wrap text-[15px] leading-7">
                {message.content}
              </p>
            )}
          </div>
        </div>

        {isMine && !shouldGroup && (
          <div className="mt-1 text-xs text-zinc-400">
            You • {time}
            {message.edited && " • edited"}
          </div>
        )}
      </div>
    </div>
  );
}
