import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function TasksPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Tasks"
      title="Tasks"
      description="A routed task area for lists, boards, calendars, and task detail pages."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Task boards and calendars can live under this route without changing the
        shell.
      </div>
    </WorkspaceSectionPage>
  );
}
