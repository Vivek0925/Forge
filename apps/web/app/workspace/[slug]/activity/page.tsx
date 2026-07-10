import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function ActivityPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Activity"
      title="Activity"
      description="A timeline of workspace changes, task updates, and shared work."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Activity feed routes can live here.
      </div>
    </WorkspaceSectionPage>
  );
}
