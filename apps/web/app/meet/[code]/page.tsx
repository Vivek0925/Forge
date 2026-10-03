"use client";

import { useEffect } from "react";
import { useActiveMeeting } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function JoinMeetingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { user, loading } = useAuth();
  const { openMeeting } = useActiveMeeting();

  useEffect(() => {
    async function joinByLink() {
      const { code } = await params;

      if (loading) return;

if (!user) {
  const returnTo = `/meet/${(await params).code}`;
  window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  return;
}

      try {
        const data = await api<{
          meetingId: string;
          workspaceSlug: string;
          meetingCode: string;
          hostId: string;
        }>("/meetings/join-code", {
          method: "POST",
          body: JSON.stringify({ meetingCode: code.toUpperCase() }),
        });

        openMeeting({
          meetingId: data.meetingId,
          slug: data.workspaceSlug,
          meetingCode: data.meetingCode,
          hostId: data.hostId,
          source: "quick-join",
        });
      } catch (error) {
        console.error("[Meeting Link]", error);
      }
    }

    void joinByLink();
  }, [openMeeting, params, user, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0D11] text-white">
      <p className="text-sm text-white/50">Opening meeting...</p>
    </div>
  );
}
