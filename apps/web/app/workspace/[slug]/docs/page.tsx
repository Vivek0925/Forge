import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function DocsPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Docs"
      title="Docs"
      description="Create and read documents in a routed docs area that stays inside the workspace shell."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Document lists, drafts, and editor pages can be added here.
      </div>
    </WorkspaceSectionPage>
  );
}
