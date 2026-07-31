"use client";

import { useEffect, useState } from "react";

import { getInvitations } from "@/lib/invitations";
import type { Invitation } from "@/types/invitation";

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return {
    invitations,
    loading,
    refresh,
  };
}