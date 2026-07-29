import type { Message } from "@/types/chats";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({
  message,
}: MessageItemProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-2">
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

      <p className="ml-12 whitespace-pre-wrap text-[15px] leading-7 text-zinc-700">
        {message.content}
      </p>
    </div>
  );
}