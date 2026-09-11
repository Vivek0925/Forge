"use client";

import { Video } from "lucide-react";

import MeetingRoom from "../meetings/components/MeetingRoom";
import { useActiveMeeting } from "./ActiveMeetingProvider";

export default function ActiveMeeting() {
  const {
    activeMeeting,
    minimized,
    meetingHidden,
    minimizeMeeting,
    restoreMeeting,
    hideMeeting,
    showMeeting,
  } = useActiveMeeting();

  if (!activeMeeting) {
    return null;
  }

  return (
    <>
      <MeetingRoom
        slug={activeMeeting.slug}
        meetingId={activeMeeting.meetingId}
        minimized={minimized}
        hidden={meetingHidden}
        onMinimize={minimizeMeeting}
        onRestore={restoreMeeting}
        onHide={hideMeeting}
      />

      {meetingHidden && (
        <button
          type="button"
          onClick={showMeeting}
          title="Show meeting"
          className="fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-[#1E8E5A] text-white shadow-2xl ring-1 ring-black/40 transition hover:bg-[#187A4B]"
        >
          <Video size={20} />
        </button>
      )}
    </>
  );
}
