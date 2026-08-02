import clsx from "clsx";

import type { Message } from "@/types/chats";

interface MessageItemProps {
  message: Message;
  previousMessage?: Message;
  currentUserId?: string;
}

export default function MessageItem({
  message,
  previousMessage,
  currentUserId,
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
        shouldGroup ? "mt-1" : "mt-6"
      )}
    >
      <div
        className={clsx(
          "flex max-w-[70%] flex-col",
          isMine ? "items-end" : "items-start"
        )}
      >
        {/* Header only for first message in group */}
        {!isMine && !shouldGroup && (
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
              {message.sender.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#20232D]">
                {message.sender.name}
              </h3>

              <span className="text-xs text-zinc-400">
                {time}
              </span>

              {message.edited && (
                <span className="text-xs text-zinc-400">
                  edited
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bubble */}
        <div
          className={clsx(
            "rounded-2xl px-4 py-2 transition-colors",
            isMine
              ? "bg-[#20232D] text-white"
              : "border border-zinc-200 bg-white text-zinc-700",

            // Connected bubbles
            shouldGroup &&
              (isMine
                ? "rounded-tr-2xl rounded-br-md"
                : "rounded-tl-2xl rounded-bl-md")
          )}
        >
          <p className="whitespace-pre-wrap text-[15px] leading-7">
            {message.content}
          </p>
        </div>

        {/* Mine timestamp only on last grouped message for now */}
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