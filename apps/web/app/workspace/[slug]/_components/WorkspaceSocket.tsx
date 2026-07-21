"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function WorkspaceSocket({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  useEffect(() => {
    console.log("WorkspaceSocket mounted");

    socket.connect();

    const onConnect = () => {
      console.log("✅ Socket connected:", socket.id);

      socket.emit("workspace:join", {
        workspaceSlug,
      });
    };

    const onPresenceUpdate = (data: unknown) => {
      console.log("Presence update:", data);
    };

    const onError = (err: Error) => {
      console.error("❌ Socket error:", err.message);
    };

    socket.on("connect", onConnect);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("connect_error", onError);

    return () => {
      socket.emit("workspace:leave", {
        workspaceSlug,
      });

      socket.off("connect", onConnect);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("connect_error", onError);

      socket.disconnect();
    };
  }, [workspaceSlug]);

  return null;
}