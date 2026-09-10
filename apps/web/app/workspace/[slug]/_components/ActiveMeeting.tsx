"use client";

import MeetingRoom from "../meetings/components/MeetingRoom";
import { useActiveMeeting } from "./ActiveMeetingProvider";

export default function ActiveMeeting() {
  const {
    activeMeeting,
    minimized,
    minimizeMeeting,
    restoreMeeting,
  } = useActiveMeeting();

  if (!activeMeeting) {
    return null;
  }

  return (
    <MeetingRoom
      slug={activeMeeting.slug}
      meetingId={activeMeeting.meetingId}
      minimized={minimized}
      onMinimize={minimizeMeeting}
      onRestore={restoreMeeting}
    />
  );
}