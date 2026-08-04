"use client";

import { useEffect, useState } from "react";

import { getWorkspaceMessages } from "@/lib/chat";
import { socket } from "@/lib/socket";

import type { Message } from "@/types/chats";

interface Attachment {
  fileName: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export function useChat(slug: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getWorkspaceMessages(slug);
        setMessages(data);
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

  useEffect(() => {
    function handleNewMessage(message: Message) {
      setMessages((prev) => [...prev, message]);
    }

    socket.on("chat:new", handleNewMessage);

    return () => {
      socket.off("chat:new", handleNewMessage);
    };
  }, []);

  const sendMessage = (
    content: string,
    attachments: Attachment[] = [],
  ) => {
    socket.emit("chat:send", {
      workspaceSlug: slug,
      content,
      attachments,
    });
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}