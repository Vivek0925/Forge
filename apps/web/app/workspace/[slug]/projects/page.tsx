import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function ProjectsPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Projects"
      title="Projects"
      description="Track every project, keep planning visible, and jump into project-specific work without leaving the workspace shell."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["Brand refresh", "Product launch", "Internal ops"].map((item) => (
          <div
            key={item}
            className="rounded-[24px] border border-[#DEDFE8] bg-[#FAFAF8] p-5"
          >
            <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
              Project
            </div>
            <div className="mt-2 text-[18px] font-medium text-[#14141C]">
              {item}
            </div>
            <div className="mt-2 text-[13px] text-[#5B5D6E]">
              Project pages, tasks, and settings can be added here next.
            </div>
          </div>
        ))}
      </div>
    </WorkspaceSectionPage>
  );
}
