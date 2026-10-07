export type {
  Task,
  TaskStatus,
  TaskPriority,
} from "@/lib/tasks";

export type TaskColumnConfig = {
  id: "TODO" | "IN_PROGRESS" | "DONE";
  title: string;
};