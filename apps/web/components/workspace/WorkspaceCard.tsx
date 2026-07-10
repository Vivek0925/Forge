"use client";

import { useState } from "react";
import {
  Delete,
  Edit3,
  Link as LinkIcon,
  Mail,
  MoreVertical,
  Settings,
} from "lucide-react";
import {
  deleteWorkspace,
  updateWorkspace,
  type Workspace,
} from "@/lib/workspace";

export interface WorkspaceCardData {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  members: string;
  accent: string;
}

interface WorkspaceCardProps {
  workspace: WorkspaceCardData;
  onUpdated?: (workspace: Workspace) => void;
  onDeleted?: (workspaceId: string) => void;
}

export default function WorkspaceCard({
  workspace,
  onUpdated,
  onDeleted,
}: WorkspaceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleOpen = () => {
    closeMenu();
    console.log(`Open workspace ${workspace.id}`);
  };

  const handleRename = async () => {
    closeMenu();

    const nextName = window.prompt("Rename workspace", workspace.name)?.trim();

    if (!nextName || nextName === workspace.name) {
      return;
    }

    try {
      setBusy(true);
      const updated = await updateWorkspace(workspace.id, { name: nextName });
      onUpdated?.(updated);
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = () => {
    closeMenu();
    console.log(`Invite members to workspace ${workspace.id}`);
  };

  const handleSettings = () => {
    closeMenu();
    console.log(`Open settings for workspace ${workspace.id}`);
  };

  const handleDelete = async () => {
    closeMenu();

    const confirmed = window.confirm(
      `Delete ${workspace.name}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusy(true);
      await deleteWorkspace(workspace.id);
      onDeleted?.(workspace.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-[28px] border border-[#DEDFE8] bg-white p-5 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`h-2.5 w-2.5 rounded-full ${workspace.accent}`} />
          <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em] text-[#14141C]">
            {workspace.name}
          </h3>
          <p className="mt-1 text-[13px] text-[#5B5D6E]">{workspace.members}</p>
        </div>
        <div className="relative flex items-start gap-2">
          <span className="rounded-full border border-[#DEDFE8] px-3 py-1 text-[12px] text-[#5B5D6E]">
            {workspace.status}
          </span>

          <button
            type="button"
            disabled={busy}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Workspace actions for ${workspace.name}`}
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#DEDFE8] text-[#5B5D6E] transition-colors hover:bg-[#FAFAF8] hover:text-[#14141C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              aria-label="Workspace actions"
              className="absolute right-0 top-11 z-20 min-w-[220px] rounded-[20px] border border-[#DEDFE8] bg-white p-2 shadow-[0_24px_64px_rgba(20,20,28,0.16)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleOpen}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <LinkIcon className="h-4 w-4 text-[#5B5D6E]" />
                Open
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleRename}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Edit3 className="h-4 w-4 text-[#5B5D6E]" />
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleInvite}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Mail className="h-4 w-4 text-[#5B5D6E]" />
                Invite
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleSettings}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Settings className="h-4 w-4 text-[#5B5D6E]" />
                Settings
              </button>
              <div className="my-2 h-px bg-[#DEDFE8]" />
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
              >
                <Delete className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 border-t border-[#DEDFE8] pt-4 text-[12px] text-[#5B5D6E]">
        Updated {workspace.updatedAt}
      </div>
    </article>
  );
}
