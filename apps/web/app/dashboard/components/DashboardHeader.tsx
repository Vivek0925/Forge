import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useInvitations } from "@/hooks/useInvitations";
import {
  acceptInvitation,
  rejectInvitation,
} from "@/lib/invitations";

export default function DashboardHeader() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    invitations,
    loading: invitationsLoading,
    refresh: refreshInvitations,
  } = useInvitations();
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;

    function handleOutsideTouch(event: PointerEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideTouch);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideTouch);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleInvitationAction(
    id: string,
    action: typeof acceptInvitation,
  ) {
    try {
      setProcessingInvitation(id);
      await action(id);
      await refreshInvitations();
    } catch (error) {
      console.error("Failed to process invitation", error);
    } finally {
      setProcessingInvitation(null);
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
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
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
          </button>

          {notificationsOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="fixed inset-x-3 top-20 z-20 max-h-[calc(100svh-6rem)] overflow-hidden rounded-2xl border border-[#DEDFE8] bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[380px]"
            >
              <div className="flex items-center justify-between border-b border-[#ECEEF3] px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#14141C]">
                    Notifications
                  </h2>
                  <p className="mt-0.5 text-xs text-[#707487]">
                    {invitations.length > 0
                      ? `${invitations.length} pending invitation${invitations.length === 1 ? "" : "s"}`
                      : "You're all caught up"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Close notifications"
                  className="rounded-full p-1.5 text-[#707487] hover:bg-[#F5F6F8] hover:text-[#14141C]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[min(60vh,420px)] overflow-y-auto">
                {invitationsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-[#707487]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-[#707487]">
                    No new notifications.
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="border-b border-[#ECEEF3] px-5 py-4 last:border-b-0"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAFBF1] text-sm font-semibold text-[#1E8E5A]">
                          {invitation.workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#14141C]">
                            {invitation.workspace.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#707487]">
                            {invitation.invitedBy.name} invited you to join as a{" "}
                            <span className="font-medium text-[#4B5563]">
                              {invitation.role.toLowerCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2 pl-[52px]">
                        <button
                          type="button"
                          disabled={processingInvitation === invitation.id}
                          onClick={() =>
                            void handleInvitationAction(
                              invitation.id,
                              rejectInvitation,
                            )
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#DEDFE8] px-3 py-1.5 text-xs font-medium text-[#4B5563] hover:bg-[#F5F6F8] disabled:opacity-60"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={processingInvitation === invitation.id}
                          onClick={() =>
                            void handleInvitationAction(
                              invitation.id,
                              acceptInvitation,
                            )
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#14141C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2F3038] disabled:opacity-60"
                        >
                          {processingInvitation === invitation.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
