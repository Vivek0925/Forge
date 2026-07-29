import { api } from "./api";
import type { Message } from "@/types/chats";

export function getWorkspaceMessages(slug: string) {
  return api<Message[]>(`/workspaces/${slug}/messages`);
}