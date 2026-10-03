"use client";

import { useEffect } from "react";

import { useActiveMeeting } from "./ActiveMeetingProvider";
import { api } from "@/lib/api";

interface MeetingRoomLauncherProps {
  slug: string;
  meetingId: string;
}

export default function MeetingRoomLauncher({
  slug,
  meetingId,
}: MeetingRoomLauncherProps) {
  const { openMeeting } = useActiveMeeting();

  useEffect(() => {
    let cancelled = false;

    async function loadMeeting() {
      try {
        const data = await api<{
          meetingCode: string;
          createdBy: { id: string };
        }>(`/meetings/${meetingId}`);

        if (cancelled) {
          return;
        }

        openMeeting({
          meetingId,
          slug,
          meetingCode: data.meetingCode,
          hostId: data.createdBy.id,
          source: "workspace",
        });
      } catch (error) {
        console.error("[Meeting Launcher]", error);
      }
    }

    void loadMeeting();

    return () => {
      cancelled = true;
    };
  }, [slug, meetingId, openMeeting]);

  return null;
}
