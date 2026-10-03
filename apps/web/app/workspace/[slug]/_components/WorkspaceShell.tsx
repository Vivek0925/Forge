"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Search, Menu } from "lucide-react";
import { getWorkspaceBySlug, type Workspace } from "@/lib/workspace";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import InviteMemberModal from "@/components/modals/InviteMemberModal";

type WorkspaceShellProps = {
  children: React.ReactNode;
};

export default function WorkspaceShell({ children }: WorkspaceShellProps) {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  function handleShellTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (sidebarOpen) {
      return;
    }

    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleShellTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;

    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;

    const distanceX = endX - touchStartX.current;
    const distanceY = endY - touchStartY.current;

    const horizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (horizontalSwipe && distanceX > 60) {
      setSidebarOpen(true);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  useEffect(() => {
    if (!slug) {
      return;
    }

    let ignore = false;

    async function loadWorkspace() {
      try {
        setLoading(true);
        const data = await getWorkspaceBySlug(slug);

        if (!ignore) {
          setWorkspace(data);
        }
      } catch {
        if (!ignore) {
          setWorkspace(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadWorkspace();

    return () => {
      ignore = true;
    };
  }, [slug]);

  const title = workspace?.name || slug || "Workspace";

  return (
    <div
      onTouchStart={handleShellTouchStart}
      onTouchEnd={handleShellTouchEnd}
      className="flex h-[100dvh] min-h-0 overflow-hidden bg-[#F8F8F6] text-[#14141C]"
    >
      <WorkspaceSidebar
        slug={slug}
        title={title}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close workspace navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-[#DEDFE8]/80 bg-white/85 px-3 backdrop-blur-xl md:h-[76px] md:gap-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DEDFE8] bg-white text-[#14141C] md:hidden"
              aria-label="Open workspace navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 md:hidden">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#059669]">
                Workspace
              </div>
              <div className="truncate text-[18px] font-medium tracking-[-0.02em] text-[#14141C]">
                {title}
              </div>
            </div>

            <div className="hidden min-w-[320px] items-center gap-2 rounded-full border border-[#DEDFE8] bg-[#FAFAF8] px-4 py-2 md:flex">
              <Search className="h-4 w-4 text-[#5B5D6E]" />
              <input
                aria-label="Search workspace"
                placeholder="Search workspace"
                className="w-full bg-transparent text-[13px] text-[#14141C] outline-none placeholder:text-[#5B5D6E]"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* button to redirect to dashboard */}
            <Link
              href="/dashboard"
              className="rounded-full border border-[#DEDFE8] bg-white px-2 py-2 text-[11px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8] sm:px-2.5 sm:text-[12px] md:px-3 md:text-[13px]"
            >
              Dashboard
            </Link>

            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-full border border-[#DEDFE8] bg-white px-2 py-2 text-[11px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8] sm:px-2.5 md:px-4"
            >
              Invite
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 sm:px-4 md:px-6">
          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[24px] border border-[#DEDFE8] bg-white px-4 text-center text-[14px] text-[#5B5D6E] shadow-[0_18px_50px_rgba(20,20,28,0.06)] sm:rounded-[32px]">
              Loading workspace...
            </div>
          ) : !workspace ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[24px] border border-[#DEDFE8] bg-white p-5 text-center shadow-[0_18px_50px_rgba(20,20,28,0.06)] sm:rounded-[32px] sm:p-8">
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#B91C1C]">
                  Workspace not found
                </div>
                <h1 className="mt-2 text-[26px] font-light tracking-[-0.03em] text-[#14141C] sm:text-[30px]">
                  We could not open this workspace.
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#5B5D6E]">
                  The workspace may have been deleted or you may not have
                  access.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex rounded-full border border-[#DEDFE8] px-5 py-2.5 text-[14px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
                >
                  Back to dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        workspaceSlug={slug}
      />
    </div>
  );
}
