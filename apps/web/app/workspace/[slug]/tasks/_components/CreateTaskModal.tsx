"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Loader2, UserRound } from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

import {
  createTask,
  getWorkspaceMembers,
  type TaskPriority,
  type WorkspaceMember,
} from "@/lib/tasks";

type CreateTaskModalProps = {
  open: boolean;
  workspaceSlug: string;
  initialStatus: "TODO" | "IN_PROGRESS" | "DONE";
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateTaskModal({
  open,
  workspaceSlug,
  initialStatus,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] =
    useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] =
    useState("");
  const [dueDate, setDueDate] = useState("");

  const [members, setMembers] = useState<
    WorkspaceMember[]
  >([]);

  const [loadingMembers, setLoadingMembers] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadMembers() {
      try {
        setLoadingMembers(true);
        setError("");

        const data =
          await getWorkspaceMembers(workspaceSlug);

        if (!cancelled) {
          setMembers(data);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load workspace members.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setAssigneeId("");
    setDueDate("");
    setError("");
  }

  function handleClose() {
    if (submitting) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createTask(workspaceSlug, {
        title: title.trim(),
        description:
          description.trim() || undefined,
        priority,
        assigneeId:
          assigneeId || undefined,
        dueDate:
          dueDate || undefined,
      });

      resetForm();
      onCreated();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create task.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create task"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Title */}
        <div>
          <label
            htmlFor="task-title"
            className="mb-1.5 block text-[12px] font-medium text-[#292929]"
          >
            Task title
          </label>

          <input
            id="task-title"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="What needs to be done?"
            autoFocus
            className="h-10 w-full rounded-[9px] border border-[#DEDFE8] bg-white px-3 text-[13px] text-[#14141C] outline-none transition focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="task-description"
            className="mb-1.5 block text-[12px] font-medium text-[#292929]"
          >
            Description
          </label>

          <textarea
            id="task-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Add some details..."
            rows={3}
            className="w-full resize-none rounded-[9px] border border-[#DEDFE8] bg-white px-3 py-2.5 text-[13px] text-[#14141C] outline-none transition focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10"
          />
        </div>

        {/* Assignee */}
        <div>
          <label
            htmlFor="task-assignee"
            className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[#292929]"
          >
            <UserRound size={13} />
            Assignee
          </label>

          <select
            id="task-assignee"
            value={assigneeId}
            onChange={(event) =>
              setAssigneeId(event.target.value)
            }
            disabled={loadingMembers}
            className="h-10 w-full rounded-[9px] border border-[#DEDFE8] bg-white px-3 text-[13px] text-[#14141C] outline-none focus:border-[#059669]"
          >
            <option value="">
              {loadingMembers
                ? "Loading members..."
                : "Unassigned"}
            </option>

            {members.map((member) => (
              <option
                key={member.userId}
                value={member.userId}
              >
                {member.user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority + due date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-priority"
              className="mb-1.5 block text-[12px] font-medium text-[#292929]"
            >
              Priority
            </label>

            <select
              id="task-priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as TaskPriority,
                )
              }
              className="h-10 w-full rounded-[9px] border border-[#DEDFE8] bg-white px-3 text-[13px] outline-none focus:border-[#059669]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="task-due-date"
              className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[#292929]"
            >
              <CalendarDays size={13} />
              Due date
            </label>

            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="h-10 w-full rounded-[9px] border border-[#DEDFE8] bg-white px-3 text-[12px] outline-none focus:border-[#059669]"
            />
          </div>
        </div>

        {/* Status */}
        <div className="rounded-[9px] bg-[#F7F7F4] px-3 py-2.5 text-[11px] text-[#737373]">
          This task will be created in{" "}
          <span className="font-medium text-[#292929]">
            {initialStatus === "TODO"
              ? "To Do"
              : initialStatus === "IN_PROGRESS"
                ? "In Progress"
                : "Done"}
          </span>
          .
        </div>

        {error && (
          <div className="rounded-[9px] border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-[#EEEEEA] pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !title.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create task"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}