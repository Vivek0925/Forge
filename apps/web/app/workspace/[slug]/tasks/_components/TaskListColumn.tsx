"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Task, TaskList } from "./task-types";
import TaskCard from "./TaskCard";

type TaskListColumnProps = {
  list: TaskList;
  onAddTask: (listId: string) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  movingTaskId: string | null;
};

export default function TaskListColumn({
  list,
  onAddTask,
  onTaskClick,
  onToggleComplete,
  movingTaskId,
}: TaskListColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  });

  const tasks = [...list.tasks].sort((a, b) => a.position - b.position);

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex h-fit max-h-full w-[310px] shrink-0 flex-col",
        "rounded-2xl border border-white/10",
        "bg-black/10 backdrop-blur-sm",
        "transition",
        isOver ? "ring-2 ring-white/30" : "",
      ].join(" ")}
    >
      {/* List header */}
      <header className="flex h-12 shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-[13px] font-semibold text-white">
            {list.name}
          </h2>

          <span className="text-[11px] text-white/45">{tasks.length}</span>
        </div>

        <button
          type="button"
          className="rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          aria-label={`List options for ${list.name}`}
        >
          <MoreHorizontal size={16} />
        </button>
      </header>

      {/* Sortable cards */}
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[20px] space-y-2 overflow-visible px-2 pb-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={
                movingTaskId === task.id
                  ? "opacity-50 transition-opacity"
                  : "transition-opacity"
              }
            >
              <TaskCard
                task={task}
                onClick={onTaskClick}
                onToggleComplete={onToggleComplete}
                isCompleted={list.name.trim().toUpperCase() === "DONE"}
              />
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/15 px-3 py-7 text-center text-[11px] text-white/35">
              Drop a card here
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add card */}
      <button
        type="button"
        onClick={() => onAddTask(list.id)}
        className="mx-2 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-xl px-2 text-left text-[12px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <Plus size={15} />
        Add a card
      </button>
    </section>
  );
}
