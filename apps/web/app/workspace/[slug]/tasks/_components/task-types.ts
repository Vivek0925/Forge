export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  assigneeId: string | null;
  dueDate: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskColumnConfig = {
  id: TaskStatus;
  title: string;
};