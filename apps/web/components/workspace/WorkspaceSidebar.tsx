"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  Folder,
  LayoutDashboard,
  LayoutList,
  MessageCircle,
  MoreHorizontal,
  Video,
  Workflow,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/lib/socket";
import {
  getWorkspaceMembers,
  type WorkspaceMember,
} from "@/lib/workspace";

const navigation = [
  { label: "Overview", href: "", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: Folder },
  { label: "Tasks", href: "/tasks", icon: LayoutList },
  { label: "Docs", href: "/docs", icon: FileText },
  { label: "Whiteboard", href: "/whiteboard", icon: Workflow },
];

const communicationNavigation = [
  { label: "Chat", href: "/chat", icon: MessageCircle },
  { label: "Meetings", href: "/meetings", icon: Video },
];

const resourceNavigation = [
  { label: "Files", href: "/files", icon: FileText },
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
  const { user } = useAuth();
  const activePath = pathname.replace(`/workspace/${slug}`, "");
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [membersExpanded, setMembersExpanded] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
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
  const userInitials = user?.name
    ? user.name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

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
      className={`fixed inset-y-0 left-0 z-50 flex w-[248px] shrink-0 flex-col border-r border-[#E8E8E8] bg-[#FCFCFB] px-3 py-4 transition-transform duration-200 md:static md:z-auto md:flex ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="flex items-center justify-between px-2 pb-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#0FA968] text-white">
            <span className="h-3.5 w-3.5 rounded-[3px] border-2 border-white" />
          </span>
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#202124]">
            Vynor
          </span>
        </Link>

        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg border border-[#E8E8E8] px-2 py-1 text-xs text-[#666] md:hidden"
          aria-label="Close workspace navigation"
        >
          Close
        </button>
      </div>

      <button
        type="button"
        className="mx-1 mb-5 flex items-center gap-3 rounded-[14px] border border-[#EAEAE8] bg-white px-3 py-3 text-left shadow-[0_2px_8px_rgba(20,20,20,0.03)]"
        aria-label={`Switch workspace, current workspace ${title}`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAFBF1] text-[#15945E]">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
        </span>
        <span className="truncate text-[14px] font-medium text-[#303236]">
          {title}
        </span>
      </button>

      <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9A9DA0]">
        Workspace
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto scrollbar-none">
        <div className="space-y-1">
          {navigation.map((item) => {
            return renderNavigationItem(item);
          })}
        </div>

        <div>
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9A9DA0]">
            Communication
          </div>
          <div className="space-y-1">
            {communicationNavigation.map((item) => renderNavigationItem(item))}
          </div>
        </div>

        <div>
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.1em] text-[#9A9DA0]">
            Resources
          </div>
          <div className="space-y-1">
            {resourceNavigation.map((item) => renderNavigationItem(item))}
          </div>
        </div>
      </nav>

      <div className="mt-3 space-y-1.5">
        <button
          type="button"
          aria-expanded={membersExpanded}
          onClick={() => setMembersExpanded((expanded) => !expanded)}
          className="min-h-[87px] w-full rounded-[12px] border border-[#EAEAE8] bg-white p-3.5 text-left transition-colors hover:border-[#C9CDC6]"
        >
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-medium text-[#303236]">Team</div>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#5B5D6E] transition-transform duration-200 ${
                membersExpanded ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {sortedMembers.slice(0, 3).map((member) => (
                <MemberAvatar key={member.userId} member={member} />
              ))}
            </div>
            <span className="text-[11px] text-[#85898C]">
              {membersLoading
                ? "Loading..."
                : membersError
                  ? "Unavailable"
                  : `${activeMemberCount} active · ${members.length} total`}
            </span>
            <span className="text-[14px] text-[#596064]">›</span>
          </div>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
              membersExpanded
                ? "mt-3 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="border-t border-[#EAEAE8] pt-2.5">
                {membersError ? (
                  <div className="text-[11px] text-[#B91C1C]">
                    Try again after refreshing the workspace.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedMembers.map((member) => (
                      <MemberRow
                        key={member.userId}
                        member={member}
                        online={onlineUserIds.has(member.userId)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-expanded={profileExpanded}
          onClick={() => setProfileExpanded((expanded) => !expanded)}
          className="w-full border-t border-[#EAEAE8] px-2 pt-3 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D7E8E2] text-[11px] font-medium text-[#27634F]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#303236]">
              {user?.name || "Your profile"}
            </div>
            <MoreHorizontal className="h-4 w-4 shrink-0 text-[#596064]" />
          </div>
          {profileExpanded && (
            <div className="mt-2 truncate pl-10 text-[11px] font-normal text-[#85898C]">
              {user?.email || "Account"}
            </div>
          )}
        </button>
      </div>
    </aside>
  );

  function renderNavigationItem(item: {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
  }) {
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
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] transition-colors ${
                active
                  ? "bg-[#E5F6EC] font-medium text-[#245C45]"
                  : "text-[#303236] hover:bg-[#F2F5F1]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
  }
}

function MemberAvatar({ member }: { member: WorkspaceMember }) {
  const initials = member.user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#EAFBF1] text-[8px] font-medium text-[#065F46]">
      {member.user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.user.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

function MemberRow({
  member,
  online,
}: {
  member: WorkspaceMember;
  online: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#303236]">
      <div className="relative">
        <MemberAvatar member={member} />
        <span
          className={`absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full border border-white ${
            online ? "bg-[#059669]" : "bg-[#A7A9B5]"
          }`}
        />
      </div>
      <span className="truncate">{member.user.name}</span>
    </div>
  );
}
