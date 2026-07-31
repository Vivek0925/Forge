"use client";

import { ReactNode } from "react";

import { useInvitations } from "@/hooks/useInvitations";
import PendingInvitationsModal from "@/components/modals/PendingInvitationsModal";

export default function InvitationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    invitations,
    loading,
    refresh,
  } = useInvitations();

  return (
    <>
      {children}

      {!loading && (
        <PendingInvitationsModal
          invitations={invitations}
          onAccepted={refresh}
        />
      )}
    </>
  );
}