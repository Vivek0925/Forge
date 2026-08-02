"use client";

import { ReactNode } from "react";

import { useAuth } from "../context/AuthContext";
import { useInvitations } from "@/hooks/useInvitations";
import PendingInvitationsModal from "@/components/modals/PendingInvitationsModal";

export default function InvitationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    invitations,
    loading: invitationLoading,
    refresh,
  } = useInvitations();

  // Wait until authentication is resolved
  if (authLoading) {
    return <>{children}</>;
  }

  // Not logged in → don't even try to show invitations
  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {!invitationLoading && invitations.length > 0 && (
        <PendingInvitationsModal
          invitations={invitations}
          onAccepted={refresh}
        />
      )}
    </>
  );
}