"use client";

import { useEffect, useState } from "react";

import {
  acceptInvitation,
  getInvitations,
} from "@/lib/invitations";

type Invitation = {
  id: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
};

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadInvitations() {
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    try {
      await acceptInvitation(id);

      setInvitations((prev) =>
        prev.filter((inv) => inv.id !== id),
      );
    } catch (err) {
      console.error(err);
      alert("Failed to accept invitation.");
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading invitations...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-8 text-3xl font-semibold">
        Pending Invitations
      </h1>

      {invitations.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-zinc-500">
          No pending invitations.
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-6"
            >
              <div>
                <h2 className="text-lg font-semibold">
                  {invitation.workspace.name}
                </h2>

                <p className="text-sm text-zinc-500">
                  Invited by {invitation.invitedBy.name}
                </p>

                <p className="mt-1 text-xs uppercase text-zinc-400">
                  {invitation.role}
                </p>
              </div>

              <button
                onClick={() =>
                  handleAccept(invitation.id)
                }
                className="rounded-xl bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}