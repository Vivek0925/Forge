"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { createWorkspace, type Workspace } from "@/lib/workspace";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspace: Workspace) => void;
}

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setCode("");
      setDescription("");
      setError("");
    }
  }, [open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const workspace = await createWorkspace({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      onCreated?.(workspace);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create workspace.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-[#DEDFE8] bg-white p-6 shadow-[0_30px_80px_rgba(20,20,28,0.18)] outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-[22px] font-medium tracking-[-0.02em] text-[#14141C]">
                Create workspace
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[14px] leading-relaxed text-[#5B5D6E]">
                Add a name, optional code, and description to get started.
              </Dialog.Description>
            </div>

            <Dialog.Close className="rounded-full border border-[#DEDFE8] px-3 py-1 text-[12px] text-[#5B5D6E] transition-colors hover:bg-[#FAFAF8]">
              Close
            </Dialog.Close>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-name"
                className="text-[13px] font-medium text-[#14141C]"
              >
                Workspace name
              </label>
              <input
                id="workspace-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Marketing sprint"
                className="h-11 rounded-[var(--radius-sm)] border border-[#DEDFE8] bg-white px-4 text-[14px] text-[#14141C] placeholder:text-[#5B5D6E]/70 outline-none transition-colors focus:border-[#059669]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-code"
                className="text-[13px] font-medium text-[#14141C]"
              >
                Code
              </label>
              <input
                id="workspace-code"
                type="text"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="FORGE-2026"
                className="h-11 rounded-[var(--radius-sm)] border border-[#DEDFE8] bg-white px-4 text-[14px] text-[#14141C] placeholder:text-[#5B5D6E]/70 outline-none transition-colors focus:border-[#059669]"
              />
              <p className="text-[12px] leading-relaxed text-[#5B5D6E]">
                Optional. Use a short code to label the workspace internally.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-description"
                className="text-[13px] font-medium text-[#14141C]"
              >
                Description
              </label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A shared space for launch planning and project updates"
                className="min-h-[112px] rounded-[var(--radius-sm)] border border-[#DEDFE8] bg-white px-4 py-3 text-[14px] text-[#14141C] placeholder:text-[#5B5D6E]/70 outline-none transition-colors focus:border-[#059669]"
              />
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <div className="mt-2 flex items-center justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full border border-[#DEDFE8] px-5 py-2.5 text-[14px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full border border-[#86D9A8] bg-[#EAFBF1] px-5 py-2.5 text-[14px] font-medium text-[#065F46] transition-colors hover:bg-[#DFF7E8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create workspace"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
