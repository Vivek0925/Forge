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
    meetingId,
    slug,
    source: "workspace",
  });
}, [slug, meetingId, openMeeting]);

  return null;
}