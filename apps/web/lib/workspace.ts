const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function createWorkspace(data: CreateWorkspacePayload) {
  return request<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify(data),
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
