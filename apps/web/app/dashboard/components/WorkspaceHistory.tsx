import EmptyWorkspaceState from "./EmptyWorkspaceState";
import WorkspaceCard, {
  WorkspaceCardData,
} from "@/components/workspace/WorkspaceCard";

interface WorkspaceHistoryProps {
  user?: { name?: string | null } | null;
  workspaces: WorkspaceCardData[];
  onWorkspaceUpdated?: () => void;
  onWorkspaceDeleted?: () => void;
}

export default function WorkspaceHistory({
  user,
  workspaces,
  onWorkspaceUpdated,
  onWorkspaceDeleted,
}: WorkspaceHistoryProps) {
  return (
    <>
      <div className="mb-8 flex flex-col items-start gap-3 sm:mb-12 sm:gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
          Workspace history
        </span>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <h2 className="text-[30px] font-light tracking-[-0.02em] text-[#14141C] sm:text-[36px]">
            Recent workspaces
          </h2>
          <p className="text-[14px] leading-relaxed text-[#5B5D6E]">
            Create workspace to see recent activity here.
          </p>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <EmptyWorkspaceState user={user} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onUpdated={() => onWorkspaceUpdated?.()}
              onDeleted={() => onWorkspaceDeleted?.()}
            />
          ))}
        </div>
      )}
    </>
  );
}
