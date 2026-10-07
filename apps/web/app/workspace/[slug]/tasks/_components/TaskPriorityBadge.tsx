import type { TaskPriority } from "./task-types";

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
};

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Low",
    className: "bg-[#F3F4F6] text-[#6B7280]",
  },
  MEDIUM: {
    label: "Medium",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  HIGH: {
    label: "High",
    className: "bg-[#FEE2E2] text-[#B91C1C]",
  },
  URGENT: {
    label: "Urgent",
    className: "bg-[#FCE7F3] text-[#BE185D]",
  },
};

export default function TaskPriorityBadge({
  priority,
}: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}