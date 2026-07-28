"use client";

import { useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState([]);

  return {
    messages,
    setMessages,
  };
}