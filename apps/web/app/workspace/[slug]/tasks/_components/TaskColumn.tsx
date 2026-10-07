"use client";

import { Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type {
  Task,
  TaskColumnConfig,
} from "./task-types";
import TaskCard from "./TaskCard";

type TaskColumnProps = {
  column: TaskColumnConfig;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskColumnConfig["id"]) => void;
};

export default function TaskColumn({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: TaskColumnProps) {
  return (
    <section className="flex h-full min-h-0 w-[310px] shrink-0 flex-col rounded-[18px] bg-[#F5F6F4] p-3">
      <header className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold text-[#27272A]">
            {column.title}
          </h2>

          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#71717A]">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask?.(column.id)}
          className="rounded-md p-1.5 text-[#71717A] transition hover:bg-white hover:text-[#18181B]"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus size={16} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex min-h-[160px] items-center justify-center rounded-[12px] border border-dashed border-[#D4D4D8]">
            <span className="text-[11px] text-[#A1A1AA]">
              No tasks
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddTask?.(column.id)}
        className="mt-3 flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left text-[12px] text-[#71717A] transition hover:bg-white hover:text-[#18181B]"
      >
        <Plus size={15} />
        Add a task
      </button>
    </section>
  );
}