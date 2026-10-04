"use client";

import { ReactNode } from "react";

export default function InvitationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}