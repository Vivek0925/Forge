"use client";

import { useEffect } from "react";
import { useActiveMeeting } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import { useAuth } from "@/context/AuthContext";

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/meetings/join-code`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              meetingCode: code.toUpperCase(),
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Meeting not found or unavailable.");
        }

        const data = await response.json();

        openMeeting({
          meetingId: data.meetingId,
          slug: data.workspaceSlug,
          meetingCode: data.meetingCode,
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
