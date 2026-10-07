"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";

import type {
  Task,
  TaskStatus,
} from "./task-types";
import TaskColumn from "./TaskColumn";

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

export default function TasksBoard({
  workspaceSlug,
}: TasksBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  /*
   * Intentionally empty for now.
   *
   * These will be populated from:
   * GET /workspaces/:slug/tasks
   *
   * No fake/mock tasks are being used.
   */
  const tasks: Task[] = [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    /*
     * Backend move API will be connected here:
     *
     * PATCH /workspaces/:slug/tasks/:taskId/move
     */
    console.log("Task moved", {
      workspaceSlug,
      taskId: active.id,
      target: over.id,
    });
  };

  const handleAddTask = (status: TaskStatus) => {
    /*
     * CreateTaskModal will be connected here.
     */
    console.log("Create task", {
      workspaceSlug,
      status,
    });
  };

  const handleTaskClick = (task: Task) => {
    /*
     * TaskDetailModal will be connected here.
     */
    console.log("Open task", task.id);
  };

  return (
    <div className="space-y-5">
      {/* Board header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[16px] font-medium text-[#18181B]">
            Board
          </h2>

          <p className="mt-1 text-[12px] text-[#71717A]">
            Organize workspace tasks and move them through the workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddTask("TODO")}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#059669] px-3.5 text-[12px] font-medium text-white transition hover:bg-[#047857]"
        >
          <Plus size={15} />
          Add task
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-x-auto pb-4">
          <div className="flex min-h-[500px] gap-4">
            {columns.map((column) => {
              const columnTasks = tasks
                .filter(
                  (task) => task.status === column.id,
                )
                .sort(
                  (a, b) => a.position - b.position,
                );

              return (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              );
            })}
          </div>
        </div>
      </DndContext>
    </div>
  );
}