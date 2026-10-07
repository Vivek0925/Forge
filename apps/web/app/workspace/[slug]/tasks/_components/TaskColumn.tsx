"use client";

import { Plus, MoreHorizontal } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import type {
  Task,
  TaskColumnConfig,
} from "./task-types";
import TaskCard from "./TaskCard";

type TaskColumnProps = {
  column: TaskColumnConfig;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (
    status: TaskColumnConfig["id"],
  ) => void;
};

export default function TaskColumn({
  column,
  tasks,
  onTaskClick,
  onAddTask,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex h-full min-h-0 w-[310px] shrink-0 flex-col",
        "overflow-hidden rounded-[14px]",
        "bg-[#F1F1EC]",
        "transition",
        isOver
          ? "ring-2 ring-white/60"
          : "",
      ].join(" ")}
    >
      {/* Column header */}
      <header className="flex h-[48px] shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[13px] font-semibold text-[#292929]">
            {column.title}
          </h2>

          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black/5 px-1.5 text-[10px] font-medium text-[#777]">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          className="rounded-md p-1.5 text-[#737373] transition hover:bg-black/5 hover:text-[#292929]"
          aria-label={`Column options for ${column.title}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </header>

      {/* ONLY THIS AREA SCROLLS */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 pb-2">
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
          <div className="flex min-h-[120px] items-center justify-center rounded-[10px] border border-dashed border-[#D2D2CC] text-[11px] text-[#999]">
            No tasks
          </div>
        )}
      </div>

      {/* Fixed bottom action */}
      <div className="shrink-0 p-2">
        <button
          type="button"
          onClick={() => onAddTask?.(column.id)}
          className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-2 text-left text-[12px] text-[#686868] transition hover:bg-black/5 hover:text-[#292929]"
        >
          <Plus size={15} />
          Add a task
        </button>
      </div>
    </section>
  );
}