    "use client";

import { useEffect, useState } from "react";
import { X, Mail, Loader2 } from "lucide-react";

import { inviteMember } from "@/lib/invitations";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  workspaceSlug: string;
}

export default function InviteMemberModal({
  open,
  onClose,
  workspaceSlug,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("MEMBER");
      setError("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleInvite() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await inviteMember(
        workspaceSlug,
        email,
        role,
      );

      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[#20232D]">
              Invite Member
            </h2>

            <p className="mt-2 text-sm text-[#707487]">
              Invite someone to collaborate in this workspace.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-[#F5F6F8]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#20232D]">
              Email
            </label>

            <div className="flex items-center rounded-2xl border border-[#DEDFE8] px-4">
              <Mail
                size={18}
                className="text-[#7C8093]"
              />

              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#20232D]">
              Role
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
              className="w-full rounded-2xl border border-[#DEDFE8] px-4 py-4 outline-none"
            >
              <option value="MEMBER">
                Member
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-2xl border border-[#DEDFE8] px-5 py-3"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={handleInvite}
              className="flex items-center gap-2 border border-[#1E8E5A] rounded-2xl bg-[#1E8E5A] px-5 py-3 font-medium text-black transition hover:bg-[#18764b] disabled:opacity-50"
            >
              {loading && (
                <Loader2
                  className="animate-spin"
                  size={16}
                />
              )}

              Send Invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}