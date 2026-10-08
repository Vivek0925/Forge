"use client";

import { MoreHorizontal, Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";

import type { Task, TaskList } from "./task-types";
import TaskCard from "./TaskCard";

type TaskListColumnProps = {
  list: TaskList;
  onAddCard: (listId: string) => void;
  onTaskClick: (task: Task) => void;
  onRename: (list: TaskList) => void;
  onDelete: (list: TaskList) => void;
};

export default function TaskListColumn({
  list,
  onAddCard,
  onTaskClick,
  onRename,
  onDelete,
}: TaskListColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  });

  const tasks = [...list.tasks].sort(
    (a, b) => a.position - b.position,
  );

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

          <span className="text-[11px] text-white/45">
            {tasks.length}
          </span>
        </div>

        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => onRename(list)}
            className="rounded-md p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={`Edit ${list.name}`}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </header>

      {/* Cards */}
      <div className="min-h-[20px] max-h-[calc(100dvh-220px)] space-y-2 overflow-y-auto px-2 pb-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 px-3 py-7 text-center text-[11px] text-white/35">
            Drop a card here
          </div>
        )}
      </div>

      {/* Add card */}
      <button
        type="button"
        onClick={() => onAddCard(list.id)}
        className="mx-2 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-xl px-2 text-left text-[12px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <Plus size={15} />
        Add a card
      </button>

      {/* Delete via simple menu for now */}
      <button
        type="button"
        onClick={() => onDelete(list)}
        className="hidden"
      />
    </section>
  );
}