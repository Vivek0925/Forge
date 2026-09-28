import clsx from "clsx";
import { ChevronDown, Pencil, Reply, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Message } from "@/types/chats";

interface MessageItemProps {
  message: Message;
  previousMessage?: Message;
  currentUserId?: string;
  onReply: (message: Message) => void;

  onEdit: (message: Message) => void;

  onDelete: (message: Message) => void;

  onReact: (message: Message, emoji: string) => void;
}

export default function MessageItem({
  message,
  previousMessage,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: MessageItemProps) {
  const isMine = message.sender.id === currentUserId;

  const [actionsOpen, setActionsOpen] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reactionOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  useEffect(() => {
    if (!actionsOpen) {
      return;
    }

    function closeActionsOnOutsidePointer(event: PointerEvent) {
      const target = event.target;

      if (target instanceof Node && !actionsRef.current?.contains(target)) {
        setActionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeActionsOnOutsidePointer);

    return () => {
      document.removeEventListener("pointerdown", closeActionsOnOutsidePointer);
    };
  }, [actionsOpen]);

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

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleMessageTouchStart() {
    clearLongPressTimer();
    longPressTimerRef.current = setTimeout(() => {
      setActionsOpen(true);
    }, 2000);
  }

  return (
    <div
      className={clsx(
        "flex",
        isMine ? "justify-end" : "justify-start",
        shouldGroup ? "mt-1" : "mt-4 sm:mt-6",
      )}
    >
      <div
        className={clsx(
          "flex max-w-[86%] flex-col sm:max-w-[70%]",
          isMine ? "items-end" : "items-start",
        )}
      >
        {!isMine && !shouldGroup && (
          <div className="mb-1.5 flex items-center gap-2 sm:mb-2 sm:gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 sm:h-9 sm:w-9 sm:text-sm">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <h3 className="truncate text-[13px] font-medium text-[#20232D] sm:text-base">
                {message.sender.name}
              </h3>

              <span className="shrink-0 text-[10px] text-zinc-400 sm:text-xs">
                {time}
              </span>

              {message.edited && (
                <span className="text-[10px] text-zinc-400 sm:text-xs">
                  edited
                </span>
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
              "relative rounded-2xl border px-3 py-1.5 transition-colors sm:px-4",
              isMine
                ? "border-[#BDE7CC] bg-[#EAFBF1] text-[#065F46]"
                : "border border-zinc-200 bg-white text-zinc-700",
              shouldGroup &&
                (isMine
                  ? "rounded-tr-2xl rounded-br-md"
                  : "rounded-tl-2xl rounded-bl-md"),
            )}
            onContextMenu={(event) => {
              event.preventDefault();
              setActionsOpen(true);
            }}
            onTouchStart={handleMessageTouchStart}
            onTouchEnd={clearLongPressTimer}
            onTouchCancel={clearLongPressTimer}
          >
            <div
              ref={actionsRef}
              className={clsx(
                "absolute top-0 z-30",
                isMine ? "right-1" : "left-1",
              )}
            >
              <button
                type="button"
                onClick={() => setActionsOpen((open) => !open)}
                className={`absolute top-1 hidden h-6 w-6 items-center justify-center p-0 text-zinc-400 opacity-0 transition hover:text-zinc-700 group-hover:opacity-100 group-focus-within:opacity-100 sm:flex sm:h-7 sm:w-7
      ${isMine ? "-right-8" : "-left-8"}
    `}
                aria-label="Message actions"
              >
                <ChevronDown size={15} />
              </button>

              {actionsOpen && (
                <div
                  className={clsx(
                    "absolute top-8 w-44 rounded-xl border border-zinc-200 bg-white p-1.5 text-left shadow-xl",
                    isMine ? "right-0" : "left-0",
                  )}
                >
                  <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    React
                  </p>

                  <div className="flex items-center gap-1 px-1 pb-1">
                    {reactionOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onReact(message, emoji);
                          setActionsOpen(false);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-sm transition hover:bg-zinc-100"
                        aria-label={`React ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {isMine && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const content = window.prompt(
                            "Edit message",
                            message.content,
                          );

                          if (content?.trim()) {
                            onEdit({ ...message, content: content.trim() });
                          }

                          setActionsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-zinc-700 transition hover:bg-zinc-100"
                      >
                        <Pencil size={14} />
                        Edit message
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Delete this message?")) {
                            onDelete(message);
                          }

                          setActionsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete message
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

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
                        className="max-h-80 w-full rounded-xl border bg-zinc-50 object-contain"
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
              <p className="whitespace-pre-wrap text-[13px] leading-6 sm:text-[15px] sm:leading-7">
                {message.content}
              </p>
            )}

            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div
                className={clsx(
                  "absolute -bottom-4 z-10 flex flex-wrap gap-1",
                  isMine ? "right-2" : "left-2",
                )}
              >
                {Object.entries(message.reactions).map(([emoji, users]) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => onReact(message, emoji)}
                    className="rounded-full border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] shadow-sm transition hover:bg-zinc-50 sm:px-2 sm:text-[11px]"
                  >
                    {emoji}
                    {users.length > 1 && ` ${users.length}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isMine && !shouldGroup && (
          <div className="mt-1 text-[10px] text-zinc-400 sm:text-xs">
            You • {time}
            {message.edited && " • edited"}
          </div>
        )}
      </div>
    </div>
  );
}
