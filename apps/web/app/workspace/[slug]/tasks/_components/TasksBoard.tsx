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

import {
  createTaskList,
  getTaskLists,
  moveTask,
} from "@/lib/tasks";

import type { Task, TaskList } from "./task-types";

import TaskCard from "./TaskCard";
import TaskListColumn from "./TaskListColumn";
import CreateTaskModal from "./CreateTaskModal";

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

  const [lists, setLists] = useState<TaskList[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const [createListOpen, setCreateListOpen] = useState(false);
  const [createTaskListId, setCreateTaskListId] = useState<string | null>(
    null,
  );

  const loadLists = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTaskLists(workspaceSlug);

      setLists(data);
    } catch (error) {
      console.error("Failed to load task lists:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  function handleDragStart(event: {
    active: {
      id: string | number;
    };
  }) {
    const taskId = String(event.active.id);

    const task = lists
      .flatMap((list) => list.tasks)
      .find((item) => item.id === taskId);

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
    const overId = String(over.id);

    const sourceList = lists.find((list) =>
      list.tasks.some((task) => task.id === taskId),
    );

    if (!sourceList) {
      return;
    }

    const task = sourceList.tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    /*
     * `over.id` can be either:
     * - another task ID
     * - a task-list ID
     */
    let targetList = lists.find((list) =>
      list.tasks.some((item) => item.id === overId),
    );

    if (!targetList) {
      targetList = lists.find((list) => list.id === overId);
    }

    if (!targetList) {
      return;
    }

    const targetTasks = [...targetList.tasks]
      .filter((item) => item.id !== taskId)
      .sort((a, b) => a.position - b.position);

    let newPosition = targetTasks.length;

    const overTaskIndex = targetTasks.findIndex(
      (item) => item.id === overId,
    );

    if (overTaskIndex !== -1) {
      newPosition = overTaskIndex;
    }

    /*
     * Nothing actually changed.
     */
    if (
      sourceList.id === targetList.id &&
      task.position === newPosition
    ) {
      return;
    }

    /*
     * Optimistic update.
     */
    setLists((current) =>
      current.map((list) => {
        if (list.id === sourceList.id && list.id === targetList.id) {
          const reordered = [...list.tasks]
            .filter((item) => item.id !== taskId)
            .sort((a, b) => a.position - b.position);

          reordered.splice(newPosition, 0, {
            ...task,
            position: newPosition,
          });

          return {
            ...list,
            tasks: reordered.map((item, index) => ({
              ...item,
              position: index,
            })),
          };
        }

        if (list.id === sourceList.id) {
          return {
            ...list,
            tasks: list.tasks
              .filter((item) => item.id !== taskId)
              .sort((a, b) => a.position - b.position)
              .map((item, index) => ({
                ...item,
                position: index,
              })),
          };
        }

        if (list.id === targetList.id) {
          const updatedTasks = [...list.tasks]
            .filter((item) => item.id !== taskId)
            .sort((a, b) => a.position - b.position);

          updatedTasks.splice(newPosition, 0, {
            ...task,
            listId: targetList.id,
            position: newPosition,
          });

          return {
            ...list,
            tasks: updatedTasks.map((item, index) => ({
              ...item,
              position: index,
            })),
          };
        }

        return list;
      }),
    );

    try {
      setMovingTaskId(taskId);

      await moveTask(
        workspaceSlug,
        taskId,
        targetList.id,
        newPosition,
      );

      /*
       * Re-sync positions with backend.
       */
      await loadLists();
    } catch (error) {
      console.error("Failed to move task:", error);

      /*
       * Restore server state.
       */
      await loadLists();
    } finally {
      setMovingTaskId(null);
    }
  }

  function handleAddTask(listId: string) {
    setCreateTaskListId(listId);
  }

  function handleTaskCreated() {
    setCreateTaskListId(null);
    void loadLists();
  }

  async function handleAddList() {
    const name = window.prompt("List name");

    if (!name?.trim()) {
      return;
    }

    try {
      await createTaskList(workspaceSlug, name.trim());
      await loadLists();
    } catch (error) {
      console.error("Failed to create task list:", error);
    }
  }

  function handleTaskClick(task: Task) {
    console.log("Open task", task.id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#DEDFE8] bg-[#6E548A] shadow-[0_18px_50px_rgba(20,20,28,0.08)] sm:rounded-[28px]">
      {/* Board top bar */}
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#49376B] px-4 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-[16px] font-semibold">
            Tasks
          </h1>

          <span className="hidden h-5 w-px bg-white/20 sm:block" />

          <span className="hidden text-[12px] text-white/65 sm:block">
            Workspace task board
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            const firstList = lists[0];

            if (firstList) {
              handleAddTask(firstList.id);
            }
          }}
          disabled={lists.length === 0}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-[9px] bg-white/15 px-3 text-[12px] font-medium text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-50"
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
              {loading ? (
                <div className="px-2 py-3 text-sm text-white/70">
                  Loading task board...
                </div>
              ) : (
                <>
                  {lists.map((list) => (
                    <TaskListColumn
                      key={list.id}
                      list={list}
                      onTaskClick={handleTaskClick}
                      onAddTask={handleAddTask}
                      movingTaskId={movingTaskId}
                    />
                  ))}

                  {/* Add another list */}
                  <button
                    type="button"
                    onClick={handleAddList}
                    className="flex h-[52px] w-[300px] shrink-0 items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/25 bg-white/10 text-[13px] font-medium text-white/75 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
                  >
                    <Plus size={16} />
                    Add another list
                  </button>
                </>
              )}
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
        open={createTaskListId !== null}
        workspaceSlug={workspaceSlug}
        listId={createTaskListId ?? ""}
        onClose={() => setCreateTaskListId(null)}
        onCreated={handleTaskCreated}
      />
    </div>
  );
}