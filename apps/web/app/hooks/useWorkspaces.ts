import { useCallback, useEffect, useState } from "react";
import { getMyWorkspaces, type Workspace } from "@/lib/workspace";
import type { WorkspaceCardData } from "@/components/workspace/WorkspaceCard";

type WorkspaceWithMeta = Workspace & {
  createdAt?: string;
  updatedAt?: string;
  memberCount?: number;
};

function getAccent(index: number) {
  const accents = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
  ];

  return accents[index % accents.length];
}

function toCardData(
  workspace: WorkspaceWithMeta,
  index: number,
): WorkspaceCardData {
  return {
    id: workspace.id,
    name: workspace.name,
    status: "Created",
    updatedAt: workspace.updatedAt
      ? new Date(workspace.updatedAt).toLocaleString()
      : "Just now",
    members: workspace.description || "No description yet",
    accent: getAccent(index),
  };
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<WorkspaceCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyWorkspaces();
      setWorkspaces(
        data.map((workspace, index) => toCardData(workspace, index)),
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load workspaces.");
      }
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addWorkspace = useCallback((workspace: Workspace) => {
    setWorkspaces((current) => [
      toCardData(workspace, current.length),
      ...current,
    ]);
  }, []);

  return {
    workspaces,
    loading,
    error,
    refresh,
    addWorkspace,
  };
}
