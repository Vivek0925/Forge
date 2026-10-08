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