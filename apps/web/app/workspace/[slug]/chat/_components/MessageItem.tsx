import clsx from "clsx";

import type { Message } from "@/types/chats";

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
}

export default function MessageItem({
  message,
  currentUserId,
}: MessageItemProps) {
  const isMine = message.sender.id === currentUserId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={clsx(
        "flex",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={clsx(
          "max-w-[70%]",
          isMine ? "items-end" : "items-start",
          "flex flex-col gap-2"
        )}
      >
        {!isMine && (
          <div className="flex items-center gap-3">
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
                  (edited)
                </span>
              )}
            </div>
          </div>
        )}

        <div
          className={clsx(
            "rounded-2xl px-4 py-3",
            isMine
              ? "bg-[#20232D] text-white rounded-br-md"
              : "border border-zinc-200 bg-white text-zinc-700 rounded-bl-md"
          )}
        >
          <p className="whitespace-pre-wrap text-[15px] leading-7">
            {message.content}
          </p>
        </div>

        {isMine && (
          <div className="text-xs text-zinc-400">
            You • {time}
            {message.edited && " • edited"}
          </div>
        )}
      </div>
    </div>
  );
}