"use client";

import { useEffect, useState } from "react";

import { getWorkspaceMessages } from "@/lib/chat";
import type { Message } from "@/types/chats";

export function useChat(slug: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const messages = await getWorkspaceMessages(slug);
        setMessages(messages);
      } catch (error) {
        console.error("Failed to load messages", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadMessages();
    }
  }, [slug]);

  return {
    messages,
    loading,
    setMessages,
  };
}