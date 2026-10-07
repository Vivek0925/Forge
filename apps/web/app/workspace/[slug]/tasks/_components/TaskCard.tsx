"use client";

import {
  CalendarDays,
  GripVertical,
  UserRound,
} from "lucide-react";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "./task-types";
import TaskPriorityBadge from "./TaskPriorityBadge";

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
};

export default function TaskCard({
  task,
  onClick,
}: TaskCardProps) {
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
        "group rounded-[14px] border border-[#E5E7EB]",
        "bg-white p-3",
        "shadow-[0_3px_12px_rgba(20,20,28,0.04)]",
        "transition",
        "hover:border-[#D1D5DB]",
        "hover:shadow-[0_6px_18px_rgba(20,20,28,0.07)]",
        "cursor-pointer",
        isDragging ? "opacity-50 shadow-lg" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="mt-0.5 cursor-grab rounded p-0.5 text-[#A1A1AA] opacity-0 transition group-hover:opacity-100 hover:bg-[#F4F4F5] active:cursor-grabbing"
          aria-label="Drag task"
        >
          <GripVertical size={15} />
        </button>

        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-medium leading-5 text-[#18181B]">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#71717A]">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TaskPriorityBadge priority={task.priority} />

            {task.assigneeId && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A]">
                <UserRound size={12} />
                Assigned
              </span>
            )}

            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#71717A]">
                <CalendarDays size={12} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}