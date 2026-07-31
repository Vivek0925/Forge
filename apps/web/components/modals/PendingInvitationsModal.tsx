"use client";

import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

import { acceptInvitation } from "@/lib/invitations";
import type { Invitation } from "@/types/invitation";

interface PendingInvitationsModalProps {
  invitations: Invitation[];
  onAccepted: () => void;
}

export default function PendingInvitationsModal({
  invitations,
  onAccepted,
}: PendingInvitationsModalProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (invitations.length === 0) {
    return null;
  }

  async function handleAccept(id: string) {
    try {
      setLoadingId(id);

      await acceptInvitation(id);

      onAccepted();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold text-[#20232D]">
          🎉 Pending Invitations
        </h2>

        <p className="mt-2 text-[#707487]">
          Join workspaces you've been invited to.
        </p>

        <div className="mt-8 space-y-5">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="rounded-2xl border border-[#ECEEF3] p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EAFBF1]">
                  <Mail
                    size={18}
                    className="text-[#1E8E5A]"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-[#20232D]">
                    {invitation.workspace.name}
                  </h3>

                  <p className="text-sm text-[#707487]">
                    Invited by{" "}
                    {invitation.invitedBy.name}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-[#F5F6F8] px-3 py-1 text-xs">
                  {invitation.role}
                </span>

                <button
                  disabled={
                    loadingId === invitation.id
                  }
                  onClick={() =>
                    handleAccept(invitation.id)
                  }
                  className="rounded-xl bg-[#1E8E5A] px-5 py-2 text-sm font-medium text-black border border-[#1E8E5A] hover:bg-[#18764B] disabled:opacity-60"
                >
                  {loadingId === invitation.id ? (
                    <Loader2
                      className="animate-spin"
                      size={16}
                    />
                  ) : (
                    "Accept"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}