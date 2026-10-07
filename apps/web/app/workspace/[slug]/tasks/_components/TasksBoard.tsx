"use client";

import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getWorkspaceTasks, moveTask } from "@/lib/tasks";

import type { Task, TaskStatus } from "./task-types";

import TaskCard from "./TaskCard";
import TaskColumn from "./TaskColumn";
import CreateTaskModal from "./CreateTaskModal";

const columns = [
  {
    id: "TODO" as const,
    title: "To Do",
  },
  {
    id: "IN_PROGRESS" as const,
    title: "In Progress",
  },
  {
    id: "DONE" as const,
    title: "Done",
  },
];

type TasksBoardProps = {
  workspaceSlug: string;
};

export default function TasksBoard({ workspaceSlug }: TasksBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getWorkspaceTasks(workspaceSlug);

      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  function handleDragStart(event: {
    active: {
      id: string | number;
    };
  }) {
    const task = tasks.find((item) => item.id === String(event.active.id));

    setActiveTask(task ?? null);
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const taskId = String(active.id);
    const targetStatus = String(over.id) as TaskStatus;

    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    // Dropped back into the same column.
    if (task.status === targetStatus) {
      return;
    }

    // Only allow known board columns.
    const isValidColumn = columns.some((column) => column.id === targetStatus);

    if (!isValidColumn) {
      return;
    }

    const targetTasks = tasks
      .filter((item) => item.status === targetStatus && item.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const newPosition =
      targetTasks.length > 0
        ? targetTasks[targetTasks.length - 1].position + 1
        : 0;

    // Optimistic UI update.
    setTasks((current) =>
      current.map((item) =>
        item.id === taskId
          ? {
              ...item,
              status: targetStatus,
              position: newPosition,
            }
          : item,
      ),
    );

    try {
      setMovingTaskId(taskId);

      await moveTask(workspaceSlug, taskId, targetStatus, newPosition);

      // Re-sync with backend positions/status.
      await loadTasks();
    } catch (error) {
      console.error("Failed to move task:", error);

      // Restore server state if move fails.
      await loadTasks();
    } finally {
      setMovingTaskId(null);
    }
  }

  function handleAddTask(status: TaskStatus) {
    setCreateStatus(status);
  }

  function handleTaskCreated() {
    setCreateStatus(null);
    void loadTasks();
  }

  function handleTaskClick(task: Task) {
    console.log("Open task", task.id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#DEDFE8] bg-[#6E548A] shadow-[0_18px_50px_rgba(20,20,28,0.08)] sm:rounded-[28px]">
      {/* Board top bar */}
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#49376B] px-4 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-[16px] font-semibold">Tasks</h1>

          <span className="hidden h-5 w-px bg-white/20 sm:block" />

          <span className="hidden text-[12px] text-white/65 sm:block">
            Workspace task board
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleAddTask("TODO")}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[9px] bg-white/15 px-3 text-[12px] font-medium text-white transition hover:bg-white/25"
        >
          <Plus size={15} />
          Add task
        </button>
      </header>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto overflow-y-hidden p-3 sm:p-4">
            <div className="flex h-full min-w-max items-start gap-3">
              {columns.map((column) => {
                const columnTasks = tasks
                  .filter((task) => task.status === column.id)
                  .sort((a, b) => a.position - b.position);

                return (
                  <TaskColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    onTaskClick={handleTaskClick}
                    onAddTask={handleAddTask}
                    movingTaskId={movingTaskId}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[310px]">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        open={createStatus !== null}
        workspaceSlug={workspaceSlug}
        initialStatus={createStatus ?? "TODO"}
        onClose={() => setCreateStatus(null)}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}
