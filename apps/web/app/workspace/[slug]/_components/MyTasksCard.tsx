"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
} from "lucide-react";

import { getMyTasks, type Task } from "@/lib/tasks";

type MyTasksCardProps = {
  workspaceSlug: string;
};

function getPriorityLabel(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "Urgent";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
  }
}

function getPriorityClass(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    case "LOW":
      return "bg-green-100 text-green-700";
  }
}

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function StatusIcon({ status }: { status: Task["status"] }) {
  if (status === "DONE") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  }

  if (status === "IN_PROGRESS") {
    return <Clock3 className="h-4 w-4 text-blue-600" />;
  }

  return <Circle className="h-4 w-4 text-[#8A8C98]" />;
}

export default function MyTasksCard({
  workspaceSlug,
}: MyTasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setLoading(true);

        const data = await getMyTasks(workspaceSlug);

        if (!cancelled) {
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to load my tasks:", error);

        if (!cancelled) {
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [workspaceSlug]);

  return (
    <div className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
            My Tasks
          </div>

          <div className="mt-1 text-[13px] text-[#8A8C98]">
            Tasks assigned to you
          </div>
        </div>

        {!loading && (
          <div className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#5B5D6E]">
            {tasks.length}
          </div>
        )}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B6D78]" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#D8D9E2] bg-white px-5 py-8 text-center">
            <div className="text-[14px] font-medium text-[#14141C]">
              No tasks assigned to you
            </div>

            <div className="mt-1 text-[13px] text-[#8A8C98]">
              You’re all caught up.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-[18px] border border-white bg-white px-4 py-3 shadow-[0_8px_20px_rgba(20,20,28,0.04)]"
              >
                <StatusIcon status={task.status} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-[#14141C]">
                    {task.title}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[12px] text-[#8A8C98]">
                    <span className="capitalize">
                      {task.status.replace("_", " ").toLowerCase()}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getPriorityClass(
                    task.priority,
                  )}`}
                >
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}