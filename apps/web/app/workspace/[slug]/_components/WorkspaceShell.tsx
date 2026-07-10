"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getWorkspaceBySlug, type Workspace } from "@/lib/workspace";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

type WorkspaceShellProps = {
  children: React.ReactNode;
};

export default function WorkspaceShell({ children }: WorkspaceShellProps) {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-[100dvh] overflow-hidden bg-[#F8F8F6] text-[#14141C]">
      <WorkspaceSidebar slug={slug} title={title} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-[#DEDFE8]/80 bg-white/85 px-4 backdrop-blur-xl md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="md:hidden">
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

          <div className="flex items-center gap-2">
            <button className="rounded-full border border-[#DEDFE8] bg-white px-4 py-2 text-[13px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8]">
              Invite
            </button>
            <button className="rounded-full bg-[#EAFBF1] px-4 py-2 text-[13px] font-medium text-[#065F46] transition-colors hover:bg-[#DFF7E8]">
              + New
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-6">
          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[32px] border border-[#DEDFE8] bg-white text-[14px] text-[#5B5D6E] shadow-[0_18px_50px_rgba(20,20,28,0.06)]">
              Loading workspace...
            </div>
          ) : !workspace ? (
            <div className="flex min-h-[50vh] items-center justify-center rounded-[32px] border border-[#DEDFE8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(20,20,28,0.06)]">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#B91C1C]">
                  Workspace not found
                </div>
                <h1 className="mt-2 text-[30px] font-light tracking-[-0.03em] text-[#14141C]">
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
    </div>
  );
}
