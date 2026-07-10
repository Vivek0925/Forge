import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";

export default function ChatPage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Chat"
      title="Chat"
      description="A workspace chat surface for conversations, threads, and future direct messages."
    >
      <div className="rounded-[24px] border border-dashed border-[#C9CDC6] bg-[#FAFAF8] p-6 text-[14px] text-[#5B5D6E]">
        Conversation routes can live here.
      </div>
    </WorkspaceSectionPage>
  );
}
