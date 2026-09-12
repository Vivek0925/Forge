"use client";

import { AuthProvider } from "../context/AuthContext";
import InvitationProvider from "../context/InvitationProvider";
import { ActiveMeetingProvider } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import ActiveMeeting from "@/app/workspace/[slug]/_components/ActiveMeeting";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <AuthProvider>
    <InvitationProvider>
      <ActiveMeetingProvider>
        {children}
        <ActiveMeeting />
      </ActiveMeetingProvider>
    </InvitationProvider>
  </AuthProvider>
);
}