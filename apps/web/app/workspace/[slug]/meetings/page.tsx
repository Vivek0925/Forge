import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function MeetingsPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Meetings"
      title="Meetings"
      description="Keep calls, scheduling, and meeting notes in one route."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        New meeting and meeting detail routes can be added under this section.
      </div>
    </WorkspaceSectionPage>
  );
}
