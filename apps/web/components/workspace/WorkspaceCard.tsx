export interface WorkspaceCardData {
  name: string;
  status: string;
  updatedAt: string;
  members: string;
  accent: string;
}

interface WorkspaceCardProps {
  workspace: WorkspaceCardData;
}

export default function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <article className="rounded-[28px] border border-[#DEDFE8] bg-white p-5 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`h-2.5 w-2.5 rounded-full ${workspace.accent}`} />
          <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em] text-[#14141C]">
            {workspace.name}
          </h3>
          <p className="mt-1 text-[13px] text-[#5B5D6E]">{workspace.members}</p>
        </div>
        <span className="rounded-full border border-[#DEDFE8] px-3 py-1 text-[12px] text-[#5B5D6E]">
          {workspace.status}
        </span>
      </div>

      <div className="mt-6 border-t border-[#DEDFE8] pt-4 text-[12px] text-[#5B5D6E]">
        Updated {workspace.updatedAt}
      </div>
    </article>
  );
}
