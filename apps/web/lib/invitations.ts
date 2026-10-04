import { api } from "./api";
import type { Invitation } from "@/types/invitation";

export async function inviteMember(
  workspaceSlug: string,
  email: string,
  role: string,
) {
  return api(`/workspaces/${workspaceSlug}/invitations`, {
    method: "POST",
    body: JSON.stringify({ email, role }),
  });
}

export async function getInvitations() {
  return api<Invitation[]>("/invitations");
}

export async function acceptInvitation(
  id: string,
) {
  return api(`/invitations/${id}/accept`, { method: "POST" });
}

export async function rejectInvitation(
  id: string,
) {
  return api(`/invitations/${id}/reject`, { method: "POST" });
}