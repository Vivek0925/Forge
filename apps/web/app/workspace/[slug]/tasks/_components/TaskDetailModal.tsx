"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import {
  deleteTask,
  getTaskLists,
  getWorkspaceMembers,
  updateTask,
  type Task,
  type TaskList,
  type TaskPriority,
  type WorkspaceMember,
} from "@/lib/tasks";

type TaskDetailModalProps = {
  open: boolean;
  task: Task | null;
  workspaceSlug: string;
  onClose: () => void;
  onUpdated: () => void;
};

const priorities: { value: TaskPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-700",
};

export default function TaskDetailModal({
  open,
  task,
  workspaceSlug,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [editing, setEditing] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [listId, setListId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoadingPermissions(true);

      try {
        const [user, workspaceMembers, taskLists] = await Promise.all([
          getCurrentUser(),
          getWorkspaceMembers(workspaceSlug),
          getTaskLists(workspaceSlug),
        ]);

        if (cancelled) return;

        setCurrentUser(user);
        setMembers(workspaceMembers);
        setLists(taskLists);
      } catch (error) {
        console.error("Failed to load task details:", error);

        if (!cancelled) {
          setCurrentUser(null);
          setMembers([]);
          setError("Unable to load your permissions. Try reopening the task.");
        }
      } finally {
        if (!cancelled) {
          setLoadingPermissions(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug]);

  useEffect(() => {
    if (!open || !task) return;

    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setListId(task.listId);
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setEditing(false);
    setError(null);
  }, [open, task]);

  if (!task) return null;

  const member = members.find((item) => item.userId === currentUser?.id);

  const canManage =
    !!currentUser &&
    (
      member?.role === "OWNER" ||
      member?.role === "ADMIN" ||
      task.createdById === currentUser.id ||
      task.assigneeId === currentUser.id
    );

  const taskList = lists.find((item) => item.id === task.listId);
  const assignee = members.find(
    (item) => item.userId === task.assigneeId,
  );
  const createdDate = new Date(task.createdAt);
  const formattedCreatedDate = Number.isNaN(createdDate.getTime())
    ? "Unknown"
    : createdDate.toLocaleDateString();

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      await updateTask(workspaceSlug, listId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        listId,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      });

      setEditing(false);
      onUpdated();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update task.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!canManage) return;

    const confirmed = window.confirm(
      "Delete this task? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteTask(workspaceSlug, listId);

      onUpdated();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete task.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-[#DEDFE8] bg-white px-3 py-2.5 text-sm text-[#14141C] outline-none focus:border-[#A8A9B3]";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "Task details"}
    >
      <div className="space-y-5">
        {loadingPermissions ? (
          <div className="flex items-center gap-2 py-8 text-sm text-[#737373]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading task details...
          </div>
        ) : (
          <>
            {!editing ? (
              <>
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-[#20202A]">
                      {task.title}
                    </h2>

                    {canManage && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          setTitle(task.title);
                          setDescription(task.description ?? "");
                          setPriority(task.priority);
                          setListId(task.listId);
                          setAssigneeId(task.assigneeId ?? "");
                          setDueDate(
                            task.dueDate ? task.dueDate.slice(0, 10) : "",
                          );
                          setError(null);
                          setEditing(true);
                        }}
                      >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#EEE8F5] px-2.5 py-1 text-xs font-medium text-[#60467D]">
                      {taskList?.name ?? task.list?.name ?? "Unknown list"}
                    </span>

                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
                    >
                      {task.priority.charAt(0) +
                        task.priority.slice(1).toLowerCase()}{" "}
                      priority
                    </span>
                  </div>
                </div>

                <section>
                  <h3 className="text-sm font-semibold text-[#353541]">
                    Description
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#646471]">
                    {task.description || "No description provided."}
                  </p>
                </section>

                <section className="space-y-4 border-t border-[#ECECE7] pt-4">
                  <div className="flex items-start gap-3">
                    <UserRound className="mt-0.5 h-4 w-4 text-[#777784]" />

                    <div>
                      <p className="text-xs text-[#777784]">Assignee</p>
                      <p className="mt-1 text-sm text-[#292934]">
                        {assignee?.user.name ??
                          task.assignee?.name ??
                          "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-[#777784]" />

                    <div>
                      <p className="text-xs text-[#777784]">Due date</p>
                      <p className="mt-1 text-sm text-[#292934]">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-[#777784]" />

                    <div>
                      <p className="text-xs text-[#777784]">Created by</p>
                      <p className="mt-1 text-sm text-[#292934]">
                        {task.createdBy?.name ?? "Unknown"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#92929D]">
                        {formattedCreatedDate}
                      </p>
                    </div>
                  </div>
                </section>

                {canManage && (
                  <div className="flex justify-end border-t border-[#ECECE7] pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      {deleting ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-1.5 h-4 w-4" />
                      )}
                      Delete task
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-[#5B5D6E]">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#5B5D6E]">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    placeholder="Add a description..."
                    className={`${fieldClass} resize-none`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-[#5B5D6E]">
                      List
                    </label>
                    <select
                      value={listId}
                      onChange={(event) => setListId(event.target.value)}
                      className={fieldClass}
                    >
                      {lists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#5B5D6E]">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(event) =>
                        setPriority(event.target.value as TaskPriority)
                      }
                      className={fieldClass}
                    >
                      {priorities.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-[#5B5D6E]">
                      Assignee
                    </label>
                    <select
                      value={assigneeId}
                      onChange={(event) => setAssigneeId(event.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Unassigned</option>
                      {members.map((item) => (
                        <option key={item.userId} value={item.userId}>
                          {item.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#5B5D6E]">
                      Due date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(event) => setDueDate(event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#ECECE7] pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {deleting ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1.5 h-4 w-4" />
                    )}
                    Delete
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditing(false);
                        setError(null);
                      }}
                      disabled={saving || deleting}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving || deleting || !title.trim()}
                    >
                      {saving && (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      )}
                      Save changes
                    </Button>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            {!canManage && !loadingPermissions && (
              <p className="border-t border-[#ECECE7] pt-3 text-xs text-[#858591]">
                You have read-only access to this task.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}