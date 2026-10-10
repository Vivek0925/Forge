"use client";

import { CalendarDays, Check } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Task } from "./task-types";
import TaskPriorityBadge from "./TaskPriorityBadge";

type TaskCardProps = {
  task: Task;
  onClick?: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  isCompleted?: boolean;
};

export default function TaskCard({
  task,
  onClick,
  onToggleComplete,
  isCompleted = false,
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
    touchAction: "none" as const,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) {
          onClick?.(task);
        }
      }}
      className={[
        "group rounded-[10px] border border-[#E1E1DC]",
        "bg-white p-3",
        "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
        "cursor-grab active:cursor-grabbing",
        "transition",
        "hover:border-[#D2D2CC]",
        "hover:shadow-[0_3px_8px_rgba(0,0,0,0.08)]",
        isDragging ? "opacity-30" : "",
      ].join(" ")}
    >
      <div className="relative min-w-0">
        {/* Completion checkbox */}
        <button
          type="button"
          aria-label={
            isCompleted ? "Mark task incomplete" : "Mark task complete"
          }
          aria-pressed={isCompleted}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete?.(task);
          }}
          className={[
            "absolute left-0 top-0.5 z-10 flex h-[19px] w-[19px]",
            "items-center justify-center rounded-full border-2",
            "transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-emerald-500",
            isCompleted
              ? "border-[#16A34A] bg-[#16A34A] text-white opacity-100"
              : "border-[#A3A3A3] bg-transparent text-transparent",
            isCompleted
              ? "translate-x-0"
              : "pointer-events-none -translate-x-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-x-0 group-focus-within:opacity-100",
            !isCompleted
              ? "hover:border-[#16A34A] hover:bg-[#16A34A] hover:text-white"
              : "",
          ].join(" ")}
        >
          {isCompleted && <Check size={12} strokeWidth={3} />}
          {!isCompleted && (
            <Check
              size={11}
              strokeWidth={3}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
        </button>

        {/* Task content slides to make room for the checkbox */}
        <div className="min-w-0">
          <h3
            className={[
              "min-w-0 text-[13px] font-medium leading-[1.4]",
              "transition-transform duration-200 ease-out",
              isCompleted
                ? "translate-x-7 text-[#858585] line-through"
                : "text-[#292929] group-hover:translate-x-7 group-focus-within:translate-x-7",
            ].join(" ")}
          >
            {task.title}
          </h3>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <TaskPriorityBadge priority={task.priority} />

            {task.assignee ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] text-[#737373]">
                {task.assignee.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt=""
                    draggable={false}
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
