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

import { createTaskList, getTaskLists, moveTask } from "@/lib/tasks";

import type { Task, TaskList } from "./task-types";

import TaskCard from "./TaskCard";
import TaskListColumn from "./TaskListColumn";
import CreateTaskModal from "./CreateTaskModal";
import TaskDetailModal from "./TaskDetailModal";

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

  const [lists, setLists] = useState<TaskList[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [movingTaskId, setMovingTaskId] = useState<string | null>(null);

  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [createTaskListId, setCreateTaskListId] = useState<string | null>(null);

  const [isAddingList, setIsAddingList] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
     * `over.id` can be:
     * 1. another task
     * 2. a list itself
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

    /*
     * Remove the dragged task from the target ordering
     * before calculating its new position.
     */
    const targetTasks = [...targetList.tasks]
      .filter((item) => item.id !== taskId)
      .sort((a, b) => a.position - b.position);

    let newPosition = targetTasks.length;

    /*
     * If we're dropping over another card,
     * insert before that card.
     */
    const overTaskIndex = targetTasks.findIndex((item) => item.id === overId);

    if (overTaskIndex !== -1) {
      newPosition = overTaskIndex;
    }

    /*
     * Same list + same position = nothing to do.
     */
    if (sourceList.id === targetList.id && task.position === newPosition) {
      return;
    }

    /*
     * Optimistic UI update.
     */
    setLists((current) =>
      current.map((list) => {
        /*
         * Same-list reorder.
         */
        if (list.id === sourceList.id && list.id === targetList.id) {
          const reordered = list.tasks
            .filter((item) => item.id !== taskId)
            .sort((a, b) => a.position - b.position);

          reordered.splice(newPosition, 0, {
            ...task,
            listId: list.id,
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

        /*
         * Remove from source list.
         */
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

        /*
         * Insert into target list.
         */
        if (list.id === targetList.id) {
          const updatedTasks = list.tasks
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

      await moveTask(workspaceSlug, taskId, targetList.id, newPosition);

      /*
       * Backend is the source of truth.
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

  async function handleCreateList() {
    const name = newListName.trim();

    if (!name || creatingList) {
      return;
    }

    try {
      setCreatingList(true);

      await createTaskList(workspaceSlug, name);

      setNewListName("");
      setIsAddingList(false);

      await loadLists();
    } catch (error) {
      console.error("Failed to create task list:", error);
    } finally {
      setCreatingList(false);
    }
  }

  function handleTaskClick(task: Task) {
    setSelectedTask(task);
  }

  async function handleToggleComplete(task: Task) {
    const sourceList = lists.find((list) =>
      list.tasks.some((item) => item.id === task.id),
    );

    if (!sourceList || movingTaskId) return;

    const isCompleted = sourceList.name.trim().toUpperCase() === "DONE";

    const targetList = isCompleted
      ? lists.find((list) => list.name.trim().toUpperCase() === "TODO")
      : lists.find((list) => list.name.trim().toUpperCase() === "DONE");

    if (!targetList || targetList.id === sourceList.id) return;

    const targetPosition = targetList.tasks.length;

    const previousLists = lists;

    setMovingTaskId(task.id);

    setLists((current) =>
      current.map((list) => {
        if (list.id === sourceList.id) {
          return {
            ...list,
            tasks: list.tasks
              .filter((item) => item.id !== task.id)
              .map((item, index) => ({
                ...item,
                position: index,
              })),
          };
        }

        if (list.id === targetList.id) {
          return {
            ...list,
            tasks: [
              ...list.tasks,
              {
                ...task,
                listId: targetList.id,
                list: {
                  id: targetList.id,
                  name: targetList.name,
                  position: targetList.position,
                },
                position: targetPosition,
              },
            ],
          };
        }

        return list;
      }),
    );

    try {
      await moveTask(workspaceSlug, task.id, targetList.id, targetPosition);

      await loadLists();
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
      setLists(previousLists);
    } finally {
      setMovingTaskId(null);
    }
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
                      onToggleComplete={handleToggleComplete}
                      onAddTask={handleAddTask}
                      movingTaskId={movingTaskId}
                    />
                  ))}

                  {/* Add another list */}
                  <div className="w-[310px] shrink-0">
                    {isAddingList ? (
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-3 backdrop-blur-sm">
                        <input
                          autoFocus
                          value={newListName}
                          onChange={(event) =>
                            setNewListName(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleCreateList();
                            }

                            if (event.key === "Escape") {
                              setNewListName("");
                              setIsAddingList(false);
                            }
                          }}
                          placeholder="List name"
                          maxLength={100}
                          className="h-10 w-full rounded-[9px] border border-white/15 bg-white px-3 text-[13px] text-[#14141C] outline-none placeholder:text-[#8A8C98] focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20"
                        />

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleCreateList()}
                            disabled={!newListName.trim() || creatingList}
                            className="h-9 rounded-[9px] bg-white px-3 text-[12px] font-medium text-[#292929] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {creatingList ? "Adding..." : "Add list"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setNewListName("");
                              setIsAddingList(false);
                            }}
                            disabled={creatingList}
                            className="h-9 rounded-[9px] px-3 text-[12px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingList(true)}
                        className="flex h-[37px] w-[210px] items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/25 bg-white/10 text-[13px] font-medium text-white/75 transition hover:border-white/40 hover:bg-white/15 hover:text-white"
                      >
                        <Plus size={16} />
                        Add another list
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[310px]">
              <TaskCard
                task={activeTask}
                isCompleted={
                  activeTask.list?.name.trim().toUpperCase() === "DONE"
                }
              />
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
      <TaskDetailModal
        open={selectedTask !== null}
        workspaceSlug={workspaceSlug}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdated={() => {
          setSelectedTask(null);
          void loadLists();
        }}
      />
    </div>
  );
}
