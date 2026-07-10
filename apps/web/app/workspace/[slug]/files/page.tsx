import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function FilesPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Files"
      title="Files"
      description="Browse shared files and folder routes without breaking the workspace shell."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Folder views can be added here.
      </div>
    </WorkspaceSectionPage>
  );
}
