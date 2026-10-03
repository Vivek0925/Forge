import { api } from "./api";

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface WorkspaceMember {
  userId: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  return api<T>(endpoint, options);
}

export function createWorkspace(data: CreateWorkspacePayload) {
  return request<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getWorkspaceBySlug(slug: string) {
  return request<Workspace>(`/workspaces/${slug}`, {
    method: "GET",
  });
}

export function updateWorkspace(
  workspaceId: string,
  data: UpdateWorkspacePayload,
) {
  return request<Workspace>(`/workspaces/${workspaceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteWorkspace(workspaceId: string) {
  return request<void>(`/workspaces/${workspaceId}`, {
    method: "DELETE",
  });
}

export function getMyWorkspaces() {
  return request<Workspace[]>("/workspaces", {
    method: "GET",
  });
}

export function getWorkspaceMembers(slug: string) {
  return request<WorkspaceMember[]>(`/workspaces/${slug}/members`, {
    method: "GET",
  });
}
