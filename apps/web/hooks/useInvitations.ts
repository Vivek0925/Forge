"use client";

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getInvitations } from "@/lib/invitations";
import type { Invitation } from "@/types/invitation";

export function useInvitations() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!user) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations", error);
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    refresh();
  }, [user, authLoading]);

  return {
    invitations,
    loading,
    refresh,
  };
}