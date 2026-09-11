"use client";

import {
  createContext,
  useCallback,
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
  meetingHidden: boolean;

  openMeeting: (meeting: ActiveMeeting) => void;
  minimizeMeeting: () => void;
  restoreMeeting: () => void;
  hideMeeting: () => void;
  showMeeting: () => void;
  closeMeeting: () => void;
}

const ActiveMeetingContext = createContext<ActiveMeetingContextValue | null>(
  null,
);

export function ActiveMeetingProvider({ children }: { children: ReactNode }) {
  const [activeMeeting, setActiveMeeting] = useState<ActiveMeeting | null>(
    null,
  );

  const [minimized, setMinimized] = useState(false);

  const [meetingHidden, setMeetingHidden] = useState(false);

  const openMeeting = useCallback((meeting: ActiveMeeting) => {
    setActiveMeeting(meeting);
    setMinimized(false);
    setMeetingHidden(false);
  }, []);

  const minimizeMeeting = useCallback(() => {
    setMinimized(true);
  }, []);

  const restoreMeeting = useCallback(() => {
    setMinimized(false);
    setMeetingHidden(false);
  }, []);

  const hideMeeting = useCallback(() => {
    setMeetingHidden(true);
  }, []);

  const showMeeting = useCallback(() => {
    setMeetingHidden(false);
  }, []);

  const closeMeeting = useCallback(() => {
    setActiveMeeting(null);
    setMinimized(false);
    setMeetingHidden(false);
  }, []);

  return (
    <ActiveMeetingContext.Provider
      value={{
        activeMeeting,
        minimized,
        meetingHidden,
        openMeeting,
        minimizeMeeting,
        restoreMeeting,
        hideMeeting,
        showMeeting,
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
