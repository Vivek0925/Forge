"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  FolderKanban,
  Grid2x2,
  LayoutDashboard,
  LayoutList,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import { socket } from "@/lib/socket";
import {
  getWorkspaceMembers,
  type WorkspaceMember,
} from "@/lib/workspace";

const navigation = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Tasks", href: "/tasks", icon: LayoutList },
  { label: "Docs", href: "/docs", icon: Grid2x2 },
  { label: "Whiteboard", href: "/whiteboard", icon: Sparkles },
  { label: "Chat", href: "/chat", icon: Wand2 },
  { label: "Meetings", href: "/meetings", icon: Bell },
  { label: "Files", href: "/files", icon: FolderKanban },
  { label: "Settings", href: "/settings", icon: Settings },
];

type WorkspaceSidebarProps = {
  slug: string;
  title: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function WorkspaceSidebar({
  slug,
  title,
  mobileOpen,
  onMobileClose,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const activePath = pathname.replace(`/workspace/${slug}`, "");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setMembersExpanded(false);
    setMembers([]);
    setOnlineUserIds(new Set());
    setMembersLoading(true);
    setMembersError(false);

    let ignore = false;

    async function loadMembers() {
      try {
        const data = await getWorkspaceMembers(slug);

        if (!ignore) {
          setMembers(data);
        }
      } catch {
        if (!ignore) {
          setMembersError(true);
        }
      } finally {
        if (!ignore) {
          setMembersLoading(false);
        }
      }
    }

    if (slug) {
      void loadMembers();
    } else {
      setMembersLoading(false);
    }

    return () => {
      ignore = true;
    };
  }, [slug]);

  useEffect(() => {
    const handlePresenceUpdate = (data: unknown) => {
      if (
        !data ||
        typeof data !== "object" ||
        !("users" in data) ||
        !Array.isArray(data.users)
      ) {
        return;
      }

      const userIds = data.users.flatMap((user) => {
        if (
          user &&
          typeof user === "object" &&
          "userId" in user &&
          typeof user.userId === "string"
        ) {
          return [user.userId];
        }

        return [];
      });

      setOnlineUserIds(new Set(userIds));
    };

    socket.on("presence:update", handlePresenceUpdate);

    return () => {
      socket.off("presence:update", handlePresenceUpdate);
    };
  }, [slug]);

  const sortedMembers = useMemo(
    () =>
      [...members].sort((a, b) => {
        const onlineDifference =
          Number(onlineUserIds.has(b.userId)) -
          Number(onlineUserIds.has(a.userId));

        return onlineDifference || a.user.name.localeCompare(b.user.name);
      }),
    [members, onlineUserIds],
  );

  const activeMemberCount = members.filter((member) =>
    onlineUserIds.has(member.userId),
  ).length;

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;

    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;

    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;

    const distanceX = endX - touchStartX.current;

    const distanceY = endY - touchStartY.current;

    const horizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (horizontalSwipe && distanceX < -60) {
      onMobileClose();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }
  return (
    <aside
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-[#DEDFE8]/80 bg-white/95 px-4 py-5 backdrop-blur-xl transition-transform duration-200 md:static md:z-auto md:flex ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex items-start justify-between px-2 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#EAFBF1] text-[#065F46] shadow-[0_10px_20px_rgba(5,150,105,0.12)]">
            <Wand2 className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#14141C]">
              Vynor
            </div>
            <div className="text-[12px] text-[#5B5D6E]">Workspace shell</div>
          </div>
        </Link>

        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-xl border border-[#DEDFE8] px-3 py-2 text-sm text-[#5B5D6E] md:hidden"
          aria-label="Close workspace navigation"
        >
          Close
        </button>
      </div>

      <div className="px-2 pb-1">
        <h1 className="text-[20px] font-semibold tracking-[-0.03em] text-[#14141C]">
          {title}
        </h1>
      </div>

      <nav className="mt-4 min-h-0 flex-1 space-y-1 scrollbar-none overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const href = item.href
            ? `/workspace/${slug}${item.href}`
            : `/workspace/${slug}`;
          const active = item.href
            ? activePath.startsWith(item.href)
            : activePath === "";

          return (
            <Link
              key={item.label}
              href={href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-[14px] transition-colors ${
                active
                  ? "bg-[#EAFBF1] text-[#065F46]"
                  : "text-[#14141C] hover:bg-[#FAFAF8]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        aria-expanded={membersExpanded}
        onClick={() => setMembersExpanded((expanded) => !expanded)}
        className="mt-4 w-full rounded-[22px] border border-[#DEDFE8] bg-[#FAFAF8] p-4 text-left transition-colors hover:border-[#C9CDC6]"
      >
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
            Members
          </div>
          <ChevronDown
            className={`h-4 w-4 text-[#5B5D6E] transition-transform duration-200 ${
              membersExpanded ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </div>

        <div className="mt-2 flex items-center gap-2 text-[13px] text-[#5B5D6E]">
          <span className="h-2 w-2 rounded-full bg-[#059669]" aria-hidden="true" />
          {membersLoading
            ? "Loading members..."
            : membersError
              ? "Unable to load members"
              : `${activeMemberCount} active · ${members.length} total`}
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            membersExpanded ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-[#DEDFE8] pt-3">
              {membersError ? (
                <div className="text-[12px] text-[#B91C1C]">
                  Try again after refreshing the workspace.
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedMembers.map((member) => {
                    const isOnline = onlineUserIds.has(member.userId);
                    const initials = member.user.name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={member.userId}
                        className="flex items-center gap-2.5 text-[13px] text-[#14141C]"
                      >
                        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EAFBF1] text-[10px] font-medium text-[#065F46]">
                          {member.user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={member.user.avatar}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                          <span
                            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-[#FAFAF8] ${
                              isOnline ? "bg-[#059669]" : "bg-[#A7A9B5]"
                            }`}
                            aria-label={isOnline ? "Online" : "Offline"}
                          />
                        </div>
                        <span className="truncate">{member.user.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    </aside>
  );
}
