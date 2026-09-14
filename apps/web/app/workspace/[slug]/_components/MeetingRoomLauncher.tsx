"use client";

import { useEffect } from "react";

import { useActiveMeeting } from "./ActiveMeetingProvider";

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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/meetings/${meetingId}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load meeting.");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        openMeeting({
          meetingId,
          slug,
          meetingCode: data.meetingCode,
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
