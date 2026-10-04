"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { MeetingNotification } from "@/types/notification";
import { socket } from "@/lib/socket";

const notificationPollIntervalMs = 15_000;

export function useNotifications() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<MeetingNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const previousIds = useRef<Set<string>>(new Set());
  const hasLoaded = useRef(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return false;
    }

    try {
      const data = await api<MeetingNotification[]>("/notifications");
      const newNotificationArrived =
        hasLoaded.current &&
        data.some((notification) => !previousIds.current.has(notification.id));

      previousIds.current = new Set(data.map((notification) => notification.id));
      hasLoaded.current = true;
      setNotifications(data);
      return newNotificationArrived;
    } catch (error) {
      console.error("Failed to load notifications", error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    function handleNewNotification(notification: MeetingNotification) {
      setNotifications((current) => {
        if (current.some((item) => item.id === notification.id)) {
          return current;
        }

        previousIds.current.add(notification.id);
        return [notification, ...current];
      });
    }

    socket.on("notification:new", handleNewNotification);
    if (!socket.connected) {
      socket.connect();
    }

    const initialRefresh = window.setTimeout(() => {
      void refresh();
    }, 0);
    const interval = window.setInterval(() => {
      void refresh();
    }, notificationPollIntervalMs);

    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      socket.off("notification:new", handleNewNotification);
    };
  }, [authLoading, refresh]);

  return { notifications, loading, refresh };
}
