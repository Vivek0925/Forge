"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Trash2, UserRound, X } from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
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

const priorities: {
  value: TaskPriority;
  label: string;
}[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export default function TaskDetailModal({
  open,
  task,
  workspaceSlug,
  onClose,
  onUpdated,
}: TaskDetailModalProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
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
    if (!open || !task) {
      return;
    }

    useEffect(() => {
      if (!open) {
        return;
      }

      let cancelled = false;

      async function loadLists() {
        try {
          const data = await getTaskLists(workspaceSlug);

          if (!cancelled) {
            setLists(data);
          }
        } catch (error) {
          console.error("Failed to load task lists:", error);
        }
      }

      void loadLists();

      return () => {
        cancelled = true;
      };
    }, [open, workspaceSlug]);

    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setListId(task.listId);
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setError(null);
  }, [open, task]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadMembers() {
      try {
        const data = await getWorkspaceMembers(workspaceSlug);

        if (!cancelled) {
          setMembers(data);
        }
      } catch (error) {
        console.error("Failed to load workspace members:", error);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug]);

  if (!task) {
    return null;
  }

  const currentTask = task;

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      await updateTask(workspaceSlug, currentTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        listId,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      });

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
    const confirmed = window.confirm(
      "Delete this task? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      await deleteTask(workspaceSlug, currentTask.id);

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

  return (
    <Modal open={open} onClose={onClose} title="Task details">
      <div className="space-y-5">
        <div>
          <label className="text-[12px] font-medium text-[#5B5D6E]">
            Title
          </label>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1.5 w-full rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[14px] text-[#14141C] outline-none focus:border-[#A8A9B3]"
          />
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#5B5D6E]">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            placeholder="Add a description..."
            className="mt-1.5 w-full resize-none rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[14px] text-[#14141C] outline-none placeholder:text-[#9A9BA5] focus:border-[#A8A9B3]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[12px] font-medium text-[#5B5D6E]">
              List
            </label>

            <select
              value={listId}
              onChange={(event) => setListId(event.target.value)}
              className="mt-1.5 w-full rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[13px] text-[#14141C] outline-none"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-medium text-[#5B5D6E]">
              Priority
            </label>

            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
              className="mt-1.5 w-full rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[13px] text-[#14141C] outline-none"
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
            <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#5B5D6E]">
              <UserRound size={13} />
              Assignee
            </label>

            <select
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              className="mt-1.5 w-full rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[13px] text-[#14141C] outline-none"
            >
              <option value="">Unassigned</option>

              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[12px] font-medium text-[#5B5D6E]">
              <CalendarDays size={13} />
              Due date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-1.5 w-full rounded-[12px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[13px] text-[#14141C] outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-[12px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#ECECE7] pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving || deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || deleting || !title.trim()}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
