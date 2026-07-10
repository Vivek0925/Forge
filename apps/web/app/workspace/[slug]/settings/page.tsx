import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function SettingsPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Settings"
      title="Workspace settings"
      description="General settings, members, roles, integrations, and billing can live under this route tree."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Workspace settings sections can be added here next.
      </div>
    </WorkspaceSectionPage>
  );
}
