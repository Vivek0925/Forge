"use client";

import { CalendarDays, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "./task-types";
import TaskPriorityBadge from "./TaskPriorityBadge";

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => onClick?.(task)}
      className={[
        "group rounded-[10px] border border-[#E1E1DC]",
        "bg-white p-3",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        "cursor-pointer",
        "transition",
        "hover:border-[#D2D2CC]",
        "hover:shadow-[0_3px_8px_rgba(0,0,0,0.08)]",
        isDragging ? "opacity-30" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 shrink-0 cursor-grab rounded p-0.5 text-[#A3A3A3] opacity-0 transition group-hover:opacity-100 hover:bg-[#F4F4F1] active:cursor-grabbing"
          aria-label="Drag task"
        >
          <GripVertical size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-medium leading-[1.4] text-[#292929]">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.5] text-[#737373]">
              {task.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <TaskPriorityBadge priority={task.priority} />

            {task.assignee ? (
  <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] text-[#737373]">
    {task.assignee.avatar ? (
      <img
        src={task.assignee.avatar}
        alt=""
        className="h-4 w-4 shrink-0 rounded-full object-cover"
      />
    ) : (
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E9E5EF] text-[8px] font-medium text-[#5B476F]">
        {task.assignee.name.charAt(0).toUpperCase()}
      </span>
    )}

    <span className="max-w-[90px] truncate">
      {task.assignee.name}
    </span>
  </span>
) : (
  <span className="inline-flex items-center gap-1 text-[10px] text-[#737373]">
    <span className="text-[12px]">+</span>
    Assign
  </span>
)}

            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#737373]">
                <CalendarDays size={11} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
