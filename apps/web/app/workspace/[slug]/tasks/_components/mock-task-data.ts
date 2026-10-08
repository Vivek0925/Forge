import type { Task, TaskList, TaskUser } from "./task-types";

const vivek: TaskUser = {
  id: "user-vivek",
  name: "Vivek Mandal",
  email: "vivek@example.com",
  avatar: null,
};

const rahul: TaskUser = {
  id: "user-rahul",
  name: "Rahul Sharma",
  email: "rahul@example.com",
  avatar: null,
};

const aryan: TaskUser = {
  id: "user-aryan",
  name: "Aryan Patel",
  email: "aryan@example.com",
  avatar: null,
};

const todoId = "list-todo";
const progressId = "list-progress";
const doneId = "list-done";

const task = (
  id: string,
  listId: string,
  title: string,
  assignee: TaskUser | null,
  priority: Task["priority"],
  position: number,
): Task => ({
  id,
  workspaceId: "demo-workspace",
  listId,
  title,
  description: null,
  priority,
  position,
  assigneeId: assignee?.id ?? null,
  assignee,
  createdById: vivek.id,
  createdBy: vivek,
  dueDate: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mockTaskLists: TaskList[] = [
  {
    id: todoId,
    workspaceId: "demo-workspace",
    name: "TODO",
    position: 0,
    createdById: vivek.id,
    createdBy: vivek,
    tasks: [
      task(
        "task-1",
        todoId,
        "Fix authentication",
        vivek,
        "HIGH",
        0,
      ),
      task(
        "task-2",
        todoId,
        "Design dashboard",
        rahul,
        "MEDIUM",
        1,
      ),
      task(
        "task-3",
        todoId,
        "Setup deployment",
        aryan,
        "LOW",
        2,
      ),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: progressId,
    workspaceId: "demo-workspace",
    name: "IN PROGRESS",
    position: 1,
    createdById: vivek.id,
    createdBy: vivek,
    tasks: [
      task(
        "task-4",
        progressId,
        "Build workspace API",
        rahul,
        "HIGH",
        0,
      ),
      task(
        "task-5",
        progressId,
        "Implement meetings",
        vivek,
        "MEDIUM",
        1,
      ),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  {
    id: doneId,
    workspaceId: "demo-workspace",
    name: "DONE",
    position: 2,
    createdById: vivek.id,
    createdBy: vivek,
    tasks: [
      task(
        "task-6",
        doneId,
        "Setup PostgreSQL",
        vivek,
        "LOW",
        0,
      ),
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];