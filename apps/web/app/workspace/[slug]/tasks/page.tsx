"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CirclePlus,
  MoreHorizontal,
  UserRound,
} from "lucide-react";

import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Fix authentication bug",
    description: "Investigate the OAuth callback flow and session handling.",
    status: "TODO",
    priority: "HIGH",
    assignee: { name: "Vivek Mandal" },
    dueDate: "Oct 8",
  },
  {
    id: "2",
    title: "Update workspace members UI",
    status: "TODO",
    priority: "MEDIUM",
    assignee: { name: "Rahul Sharma" },
  },
  {
    id: "3",
    title: "Implement task API",
    description: "Finish repository, service and controller integration.",
    status: "IN_PROGRESS",
    priority: "URGENT",
    assignee: { name: "Vivek Mandal" },
    dueDate: "Oct 7",
  },
  {
    id: "4",
    title: "Review meeting authorization",
    status: "IN_PROGRESS",
    priority: "HIGH",
    assignee: { name: "Aryan Patel" },
  },
  {
    id: "5",
    title: "Configure production domain",
    status: "DONE",
    priority: "MEDIUM",
    assignee: { name: "Vivek Mandal" },
  },
];

const columns: {
  status: TaskStatus;
  label: string;
}[] = [
  {
    status: "TODO",
    label: "To do",
  },
  {
    status: "IN_PROGRESS",
    label: "In progress",
  },
  {
    status: "DONE",
    label: "Done",
  },
];

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-[#F1F5F9] text-[#64748B]",
  MEDIUM: "bg-[#EFF6FF] text-[#3B82F6]",
  HIGH: "bg-[#FFF7ED] text-[#EA580C]",
  URGENT: "bg-[#FEF2F2] text-[#DC2626]",
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const taskCount = tasks.length;

  const tasksByStatus = useMemo(() => {
    return columns.reduce(
      (result, column) => {
        result[column.status] = tasks.filter(
          (task) => task.status === column.status,
        );

        return result;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [tasks]);

  function handleMove(taskId: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task,
      ),
    );
  }

  return (
    <WorkspaceSectionPage
      eyebrow="Tasks"
      title="Tasks"
      description="Plan, organize, and track work across your workspace."
    >
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#DEDFE8] bg-white px-3 text-[13px] font-medium text-[#30313A] shadow-sm transition hover:bg-[#FAFAF8]"
            >
              Board
              <ChevronDown className="h-3.5 w-3.5 text-[#777985]" />
            </button>

            <span className="text-[13px] text-[#8A8B96]">
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#14141C] px-4 text-[13px] font-medium text-white transition hover:bg-[#27272F]"
          >
            <CirclePlus className="h-4 w-4" />
            Add task
          </button>
        </div>

        {/* Board */}
        <div className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.status];

            return (
              <div
                key={column.status}
                className="min-h-[420px] rounded-[22px] border border-[#DEDFE8] bg-[#F8F8F6] p-3"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-semibold text-[#292A32]">
                      {column.label}
                    </h2>

                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-medium text-[#777985]">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-[#8A8B96] transition hover:bg-white hover:text-[#30313A]"
                    aria-label={`${column.label} options`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={handleMove}
                    />
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="flex min-h-[120px] items-center justify-center rounded-[18px] border border-dashed border-[#D4D5D0] text-[12px] text-[#9A9BA4]">
                      No tasks
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium text-[#777985] transition hover:bg-white hover:text-[#30313A]"
                >
                  <CirclePlus className="h-3.5 w-3.5" />
                  Add task
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </WorkspaceSectionPage>
  );
}

function TaskCard({
  task,
  onMove,
}: {
  task: Task;
  onMove: (taskId: string, status: TaskStatus) => void;
}) {
  return (
    <article className="group rounded-[18px] border border-[#E2E3E8] bg-white p-4 shadow-[0_4px_18px_rgba(20,20,28,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(20,20,28,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[13px] font-medium leading-5 text-[#202128]">
          {task.title}
        </h3>

        <button
          type="button"
          className="shrink-0 rounded-lg p-1 text-[#A0A1AA] opacity-0 transition hover:bg-[#F5F5F3] hover:text-[#30313A] group-hover:opacity-100"
          aria-label="Task options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#777985]">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-medium ${priorityStyles[task.priority]}`}
        >
          {priorityLabels[task.priority]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F0F0F1] pt-3">
        {task.assignee ? (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F5EF] text-[9px] font-semibold text-[#16805A]">
              {getInitials(task.assignee.name)}
            </div>

            <span className="truncate text-[11px] text-[#686A76]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-[#A0A1AA]">
            <UserRound className="h-3.5 w-3.5" />
            Unassigned
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#777985]">
            <CalendarDays className="h-3.5 w-3.5" />
            {task.dueDate}
          </div>
        )}
      </div>

      {/* Temporary status controls.
          We'll replace these with drag-and-drop later. */}
      <div className="mt-3 flex gap-1">
        {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[])
          .filter((status) => status !== task.status)
          .map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onMove(task.id, status)}
              className="rounded-md px-2 py-1 text-[9px] text-[#8A8B96] transition hover:bg-[#F5F5F3] hover:text-[#30313A]"
            >
              →{" "}
              {status === "TODO"
                ? "To do"
                : status === "IN_PROGRESS"
                  ? "In progress"
                  : "Done"}
            </button>
          ))}
      </div>
    </article>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}