import { api } from "@/lib/api";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type Task = {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assigneeId: string | null;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: {
    name: string;
    avatar: string | null;
  };
};

export async function getWorkspaceTasks(
  workspaceSlug: string,
) {
  return api<Task[]>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks`,
  );
}

export async function getMyTasks(
  workspaceSlug: string,
) {
  return api<Task[]>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks/my`,
  );
}


export async function getWorkspaceMembers(
  workspaceSlug: string,
) {
  return api<WorkspaceMember[]>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/members`,
  );
}

export async function createTask(
  workspaceSlug: string,
  input: CreateTaskInput,
) {
  return api<Task>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function deleteTask(
  workspaceSlug: string,
  taskId: string,
) {
  return api<{ id: string }>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );
}

export async function updateTask(
  workspaceSlug: string,
  taskId: string,
  input: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
  },
) {
  return api<Task>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks/${taskId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function moveTask(
  workspaceSlug: string,
  taskId: string,
  status: TaskStatus,
  position: number,
) {
  return api<Task>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks/${taskId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        position,
      }),
    }
    ,
  );
}