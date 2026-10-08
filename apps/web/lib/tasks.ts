import { api } from "@/lib/api";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";


export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type Task = {
  id: string;
  workspaceId: string;

  listId: string;
  list: {
  id: string;
  name: string;
  position: number;
};

  title: string;
  description: string | null;

  priority: TaskPriority;
  position: number;

  assigneeId: string | null;
  assignee: TaskUser | null;

  createdById: string;
  createdBy: TaskUser;

  dueDate: string | null;

  createdAt: string;
  updatedAt: string;
  
};

export type TaskList = {
  id: string;
  workspaceId: string;
  name: string;
  position: number;

  createdById: string;
  createdBy: TaskUser;

  tasks: Task[];

  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  listId: string;
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

export async function getTaskLists(workspaceSlug: string) {
  return api<TaskList[]>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/task-lists`,
  );
}

export async function createTaskList(
  workspaceSlug: string,
  name: string,
) {
  return api<TaskList>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/task-lists`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
  );
}

export async function updateTaskList(
  workspaceSlug: string,
  listId: string,
  name: string,
) {
  return api<TaskList>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/task-lists/${listId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ name }),
    },
  );
}

export async function moveTaskList(
  workspaceSlug: string,
  listId: string,
  position: number,
) {
  return api<TaskList>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/task-lists/${listId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({ position }),
    },
  );
}

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
    listId?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
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
  listId: string,
  position: number,
) {
  return api<Task>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/tasks/${taskId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({
        listId,
        position,
      }),
    },
  );
}