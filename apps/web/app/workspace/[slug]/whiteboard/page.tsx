import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function WhiteboardPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Whiteboard"
      title="Whiteboard"
      description="Sketch ideas, map flows, and plan visually inside the workspace route."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Whiteboard canvases and board IDs can be mounted here later.
      </div>
    </WorkspaceSectionPage>
  );
}
