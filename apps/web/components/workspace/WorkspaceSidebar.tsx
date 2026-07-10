"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FolderKanban,
  Grid2x2,
  LayoutDashboard,
  LayoutList,
  Settings,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

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
};

export default function WorkspaceSidebar({
  slug,
  title,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const activePath = pathname.replace(`/workspace/${slug}`, "");

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-[#DEDFE8]/80 bg-white/90 px-4 py-5 backdrop-blur-xl md:flex md:flex-col">
      <Link href="/dashboard" className="flex items-center gap-3 px-2 pb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[#EAFBF1] text-[#065F46] shadow-[0_10px_20px_rgba(5,150,105,0.12)]">
          <Wand2 className="h-5 w-5" />
        </span>
        <div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#14141C]">
            Forge
          </div>
          <div className="text-[12px] text-[#5B5D6E]">Workspace shell</div>
        </div>
      </Link>

      <div className="rounded-[22px] border border-[#DEDFE8] bg-[#FAFAF8] p-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#5B5D6E]">
          Current workspace
        </div>
        <div className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-[#14141C]">
          {title}
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-hidden">
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

      <div className="mt-4 rounded-[22px] border border-[#DEDFE8] bg-[#FAFAF8] p-4">
        <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
          Members
        </div>
        <div className="mt-2 flex items-center gap-2 text-[13px] text-[#5B5D6E]">
          <Users className="h-4 w-4" />
          Team access and invites will live here.
        </div>
      </div>
    </aside>
  );
}
