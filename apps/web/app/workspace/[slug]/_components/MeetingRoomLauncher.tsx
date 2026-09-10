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
    openMeeting({
      slug,
      meetingId,
    });
  }, [slug, meetingId, openMeeting]);

  return null;
}