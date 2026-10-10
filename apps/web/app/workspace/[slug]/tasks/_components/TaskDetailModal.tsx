"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import {
  createTaskComment,
  deleteTask,
  getTaskComments,
  getTaskLists,
  getWorkspaceMembers,
  updateTask,
  type Task,
  type TaskComment,
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

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-[#DEDFE8] bg-white px-3 py-2.5 text-sm text-[#14141C] outline-none focus:border-[#A8A9B3]";

function formatDate(value: string | null | undefined) {
  if (!value) return "No date";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff >= 0 && diff < 60_000) return "Just now";

  if (diff >= 0 && diff < 3_600_000) {
    const minutes = Math.floor(diff / 60_000);
    return `${minutes}m ago`;
  }

  if (
    date.toDateString() === now.toDateString()
  ) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
}

function Avatar({
  name,
  avatar,
  size = "md",
}: {
  name: string;
  avatar: string | null;
  size?: "sm" | "md";
}) {
  const sizeClass =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : "h-9 w-9 text-xs";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full border border-black/5 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#EAE4F5] font-semibold text-[#60467D]`}
      aria-label={name}
      title={name}
    >
      {initials}
    </div>
  );
}

export default function TaskDetailModal({
  open,
  task,
  workspaceSlug,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);

  const [members, setMembers] =
    useState<WorkspaceMember[]>([]);

  const [lists, setLists] = useState<TaskList[]>([]);

  const [editing, setEditing] = useState(false);
  const [loadingPermissions, setLoadingPermissions] =
    useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");
  const [listId, setListId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] =
    useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const loadComments = useCallback(async () => {
    if (!task) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const result = await getTaskComments(
        workspaceSlug,
        task.id,
      );

      setComments(result);
    } catch (err) {
      setCommentsError(
        err instanceof Error
          ? err.message
          : "Unable to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  }, [task, workspaceSlug]);

  useEffect(() => {
    if (!open || !task) {
      setEditing(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      setLoadingPermissions(true);
      setError(null);

      try {
        const [user, workspaceMembers, taskLists] =
          await Promise.all([
            getCurrentUser(),
            getWorkspaceMembers(workspaceSlug),
            getTaskLists(workspaceSlug),
          ]);

        if (cancelled) return;

        setCurrentUser(user);
        setMembers(workspaceMembers);
        setLists(taskLists);
      } catch (err) {
        console.error("Failed to load task details:", err);

        if (!cancelled) {
          setCurrentUser(null);
          setMembers([]);
          setError(
            "Unable to load your permissions. Try reopening the task.",
          );
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
  }, [open, workspaceSlug, task]);

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
    setCommentText("");
    setComments([]);
  }, [open, task]);

  useEffect(() => {
    if (!open || !task) return;

    void loadComments();
  }, [open, task?.id, loadComments]);

  if (!task) return null;

  const member = members.find(
    (item) => item.userId === currentUser?.id,
  );

  const canManage =
    !!currentUser &&
    (member?.role === "OWNER" ||
      member?.role === "ADMIN" ||
      task.createdById === currentUser.id ||
      task.assigneeId === currentUser.id);

  const taskList = lists.find((item) => item.id === task.listId);

  const assignee = members.find(
    (item) => item.userId === task.assigneeId,
  );

  const formattedCreatedDate = formatDate(task.createdAt);

 async function handleSave() {
  if (!task || !canManage) return;

  try {
    setSaving(true);
    setError(null);

    await updateTask(workspaceSlug, task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      listId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });

    setEditing(false);
    onUpdated();
    onClose();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to update task.",
    );
  } finally {
    setSaving(false);
  }
}

  async function handleDelete() {
    if (!task || !canManage) return;

    const confirmed = window.confirm(
      "Delete this task? This cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);

      await deleteTask(workspaceSlug, task.id);

      onUpdated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task.",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handlePostComment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content = commentText.trim();

    if (!task || !content || postingComment) return;

    try {
      setPostingComment(true);
      setCommentsError(null);

      const created = await createTaskComment(
        workspaceSlug,
        task.id,
        content,
      );

      setComments((previous) => [
        ...previous,
        created,
      ]);
      setCommentText("");
    } catch (err) {
      setCommentsError(
        err instanceof Error
          ? err.message
          : "Failed to post comment.",
      );
    } finally {
      setPostingComment(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit task" : "Task details"}
    >
      <div className="w-full min-w-0">
        {loadingPermissions ? (
          <div className="flex items-center gap-2 py-10 text-sm text-[#737373]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading task details...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
              {/* Left: task details */}
              <section className="min-w-0 space-y-5">
                {!editing ? (
                  <>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="min-w-0 break-words text-xl font-semibold text-[#20202A]">
                          {task.title}
                        </h2>

                        {canManage && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              setTitle(task.title);
                              setDescription(
                                task.description ?? "",
                              );
                              setPriority(task.priority);
                              setListId(task.listId);
                              setAssigneeId(
                                task.assigneeId ?? "",
                              );
                              setDueDate(
                                task.dueDate
                                  ? task.dueDate.slice(0, 10)
                                  : "",
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

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-[#EEE8F5] px-2.5 py-1 text-xs font-medium text-[#60467D]">
                          {taskList?.name ??
                            task.list?.name ??
                            "Unknown list"}
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

                    <div>
                      <h3 className="text-sm font-semibold text-[#353541]">
                        Description
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#646471]">
                        {task.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="space-y-4 border-t border-[#ECECE7] pt-4">
                      <div className="flex items-start gap-3">
                        <UserRound className="mt-0.5 h-4 w-4 text-[#777784]" />
                        <div>
                          <p className="text-xs text-[#777784]">
                            Assignee
                          </p>
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
                          <p className="text-xs text-[#777784]">
                            Due date
                          </p>
                          <p className="mt-1 text-sm text-[#292934]">
                            {task.dueDate
                              ? formatDate(task.dueDate)
                              : "No due date"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 text-[#777784]" />
                        <div>
                          <p className="text-xs text-[#777784]">
                            Created by
                          </p>
                          <p className="mt-1 text-sm text-[#292934]">
                            {task.createdBy?.name ?? "Unknown"}
                          </p>
                          <p className="mt-0.5 text-xs text-[#92929D]">
                            {formattedCreatedDate}
                          </p>
                        </div>
                      </div>
                    </div>

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

                    {!canManage && (
                      <p className="border-t border-[#ECECE7] pt-3 text-xs text-[#858591]">
                        You have read-only access to this task.
                      </p>
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
                        onChange={(event) =>
                          setTitle(event.target.value)
                        }
                        maxLength={200}
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#5B5D6E]">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(event) =>
                          setDescription(event.target.value)
                        }
                        rows={4}
                        maxLength={5000}
                        placeholder="Add a description..."
                        className={`${fieldClass} resize-y`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#5B5D6E]">
                        List
                      </label>
                      <select
                        value={listId}
                        onChange={(event) =>
                          setListId(event.target.value)
                        }
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
                          setPriority(
                            event.target.value as TaskPriority,
                          )
                        }
                        className={fieldClass}
                      >
                        {priorities.map((item) => (
                          <option
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#5B5D6E]">
                        Assignee
                      </label>
                      <select
                        value={assigneeId}
                        onChange={(event) =>
                          setAssigneeId(event.target.value)
                        }
                        className={fieldClass}
                      >
                        <option value="">Unassigned</option>
                        {members.map((item) => (
                          <option
                            key={item.userId}
                            value={item.userId}
                          >
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
                        onChange={(event) =>
                          setDueDate(event.target.value)
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 border-t border-[#ECECE7] pt-4">
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
                        disabled={
                          saving ||
                          deleting ||
                          !title.trim() ||
                          !listId
                        }
                      >
                        {saving && (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        )}
                        Save changes
                      </Button>
                    </div>
                  </>
                )}
              </section>

              {/* Right: comments */}
              <section className="flex min-h-[320px] min-w-0 flex-col border-t border-[#ECECE7] pt-5 md:min-h-[460px] md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <div className="flex items-center justify-between gap-2 border-b border-[#ECECE7] pb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#60467D]" />
                    <h3 className="text-sm font-semibold text-[#292934]">
                      Comments & activity
                    </h3>
                    <span className="rounded-full bg-[#F0EDF5] px-2 py-0.5 text-xs text-[#60467D]">
                      {comments.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => void loadComments()}
                    disabled={commentsLoading}
                    aria-label="Refresh comments"
                    title="Refresh comments"
                    className="rounded-lg p-1.5 text-[#777784] transition hover:bg-[#F4F3F7] disabled:opacity-50"
                  >
                    <Loader2
                      className={`h-4 w-4 ${commentsLoading ? "animate-spin" : ""}`}
                    />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-4">
                  {commentsLoading && comments.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#777784]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading comments...
                    </div>
                  ) : commentsError && comments.length === 0 ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <p>{commentsError}</p>
                      <button
                        type="button"
                        onClick={() => void loadComments()}
                        className="mt-2 font-medium underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="px-3 py-10 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2EEF8]">
                        <MessageSquare className="h-5 w-5 text-[#60467D]" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-[#353541]">
                        No comments yet
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#858591]">
                        Start a conversation about this task.
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <article
                        key={comment.id}
                        className="flex min-w-0 items-start gap-2.5"
                      >
                        <Avatar
                          name={comment.author.name}
                          avatar={comment.author.avatar}
                          size="sm"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-xs font-semibold text-[#292934]">
                              {comment.author.name}
                            </span>
                            <time
                              dateTime={comment.createdAt}
                              title={new Date(
                                comment.createdAt,
                              ).toLocaleString()}
                              className="text-[10px] text-[#92929D]"
                            >
                              {formatTimestamp(comment.createdAt)}
                            </time>
                          </div>

                          <div className="mt-1.5 rounded-xl rounded-tl-sm bg-[#F5F4F8] px-3 py-2.5">
                            <p className="whitespace-pre-wrap break-words text-sm leading-5 text-[#444451]">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  )}

                  {commentsError && comments.length > 0 && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {commentsError}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handlePostComment}
                  className="border-t border-[#ECECE7] pt-4"
                >
                  <div className="flex items-start gap-2.5">
                    <Avatar
                      name={currentUser?.name ?? "You"}
                      avatar={currentUser?.avatar ?? null}
                      size="sm"
                    />

                    <div className="min-w-0 flex-1">
                      <textarea
                        value={commentText}
                        onChange={(event) =>
                          setCommentText(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            event.currentTarget.form?.requestSubmit();
                          }
                        }}
                        placeholder="Write a comment..."
                        rows={3}
                        maxLength={5000}
                        disabled={postingComment}
                        className="w-full resize-y rounded-xl border border-[#DEDFE8] bg-white px-3 py-2.5 text-sm text-[#292934] outline-none transition placeholder:text-[#A0A0AA] focus:border-[#A8A9B3] disabled:bg-[#F7F7F9]"
                      />

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#92929D]">
                          Enter to send · Shift+Enter for new line
                        </span>

                        <button
                          type="submit"
                          disabled={
                            postingComment ||
                            !commentText.trim() ||
                            loadingPermissions
                          }
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#60467D] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#503665] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {postingComment ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </section>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}