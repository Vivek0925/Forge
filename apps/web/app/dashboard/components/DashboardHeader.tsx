import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInvitations } from "@/hooks/useInvitations";

export default function DashboardHeader() {
  const router = useRouter();
  const { logout } = useAuth();
  const { invitations, loading: invitationsLoading } = useInvitations();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-[#DEDFE8]/40 py-3 sm:gap-4 sm:py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
          <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
        </span>
        <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
          Vynor
        </span>
      </Link>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/invitations"
          aria-label={
            invitationsLoading
              ? "Notifications"
              : `Notifications${invitations.length > 0 ? ` (${invitations.length} unread)` : ""}`
          }
          title="Notifications"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#DEDFE8] bg-white text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
        >
          <Bell className="h-4 w-4" />
          {!invitationsLoading && invitations.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#059669] px-1 text-[10px] font-semibold leading-none text-white">
              {invitations.length > 9 ? "9+" : invitations.length}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={loggingOut}
          className="inline-flex items-center rounded-full border border-[#DEDFE8] bg-white px-3 py-2 text-[12px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-[13px]"
        >
          <span className="hidden sm:inline">{loggingOut ? "Logging out..." : "Logout"}</span>
          <span className="sm:hidden">{loggingOut ? "..." : "Log out"}</span>
        </button>
      </div>
    </header>
  );
}
