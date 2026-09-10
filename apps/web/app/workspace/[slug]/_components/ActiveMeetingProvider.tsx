"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface ActiveMeeting {
  meetingId: string;
  slug: string;
}

interface ActiveMeetingContextValue {
  activeMeeting: ActiveMeeting | null;
  minimized: boolean;

  openMeeting: (meeting: ActiveMeeting) => void;
  minimizeMeeting: () => void;
  restoreMeeting: () => void;
  closeMeeting: () => void;
}

const ActiveMeetingContext =
  createContext<ActiveMeetingContextValue | null>(null);

export function ActiveMeetingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeMeeting, setActiveMeeting] =
    useState<ActiveMeeting | null>(null);

  const [minimized, setMinimized] = useState(false);

  function openMeeting(meeting: ActiveMeeting) {
    setActiveMeeting(meeting);
    setMinimized(false);
  }

  function minimizeMeeting() {
    setMinimized(true);
  }

  function restoreMeeting() {
    setMinimized(false);
  }

  function closeMeeting() {
    setActiveMeeting(null);
    setMinimized(false);
  }

  return (
    <ActiveMeetingContext.Provider
      value={{
        activeMeeting,
        minimized,
        openMeeting,
        minimizeMeeting,
        restoreMeeting,
        closeMeeting,
      }}
    >
      {children}
    </ActiveMeetingContext.Provider>
  );
}

export function useActiveMeeting() {
  const context = useContext(ActiveMeetingContext);

  if (!context) {
    throw new Error(
      "useActiveMeeting must be used inside ActiveMeetingProvider",
    );
  }

  return context;
}