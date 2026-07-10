import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function MembersPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Members"
      title="Members"
      description="Invite people, manage access, and review roles in a dedicated page."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Members and roles can be added here.
      </div>
    </WorkspaceSectionPage>
  );
}
