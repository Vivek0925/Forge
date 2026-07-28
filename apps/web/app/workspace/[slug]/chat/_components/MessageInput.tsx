"use client";

import { useState, KeyboardEvent } from "react";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";

export default function MessageInput() {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const content = message.trim();

    if (!content) return;

    console.log(content); // Replace with socket.emit later

    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Paperclip size={18} />
        </button>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message this workspace..."
          className="max-h-40 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />

        <button
          type="button"
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
        >
          <Smile size={18} />
        </button>

        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizontal size={18} />
        </button>
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        Press <kbd className="rounded bg-zinc-100 px-1 py-0.5">Enter</kbd> to
        send •{" "}
        <kbd className="rounded bg-zinc-100 px-1 py-0.5">Shift + Enter</kbd> for
        a new line
      </p>
    </div>
  );
}