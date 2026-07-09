import EmptyWorkspaceState from "./EmptyWorkspaceState";
import WorkspaceCard, { type WorkspaceCardData } from "./WorkspaceCard";

interface WorkspaceHistoryProps {
  user?: { name?: string | null } | null;
  workspaces: WorkspaceCardData[];
}

export default function WorkspaceHistory({
  user,
  workspaces,
}: WorkspaceHistoryProps) {
  return (
    <>
      <div className="mb-12 flex flex-col items-start gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
          Workspace history
        </span>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <h2 className="text-[36px] font-light tracking-[-0.02em] text-[#14141C]">
            Recent workspaces
          </h2>
          <p className="text-[14px] leading-relaxed text-[#5B5D6E]">
            Create your first workspace to see recent activity here.
          </p>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <EmptyWorkspaceState user={user} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.name} workspace={workspace} />
          ))}
        </div>
      )}
    </>
  );
}
