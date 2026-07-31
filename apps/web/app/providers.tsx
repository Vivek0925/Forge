"use client";

import { AuthProvider } from "../context/AuthContext";
import InvitationProvider from "../context/InvitationProvider";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <InvitationProvider>
        {children}
      </InvitationProvider>
    </AuthProvider>
  );
}