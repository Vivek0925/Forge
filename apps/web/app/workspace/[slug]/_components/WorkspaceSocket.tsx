"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";

export default function WorkspaceSocket({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  useEffect(() => {
    const joinWorkspace = () => {
      socket.emit("workspace:join", {
        workspaceSlug,
      });
    };

    const onError = (err: Error) => {
      console.error("❌ Socket error:", err.message);
    };

    socket.on("connect", joinWorkspace);
    socket.on("connect_error", onError);

    if (socket.connected) {
      joinWorkspace();
    } else {
      socket.connect();
    }

    return () => {
      socket.emit("workspace:leave", {
        workspaceSlug,
      });

      socket.off("connect", joinWorkspace);
      socket.off("connect_error", onError);

      socket.disconnect();
    };
  }, [workspaceSlug]);

  return null;
}
