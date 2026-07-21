import WorkspaceSectionPage from "./_components/WorkspaceSectionPage";
import WorkspaceSocket from "./_components/WorkspaceSocket";



const meetings = [
  { date: "JUL 10", title: "Sprint Planning", time: "Today, 10:00 AM" },
];

const documents = [
  { label: "Product Requirements.docx", meta: "Updated 2h ago" },
  { label: "API Documentation.md", meta: "Updated 5h ago" },
  { label: "Design System.fig", meta: "Updated 1d ago" },
];

function QuickStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#DEDFE8] bg-[#FAFAF8] p-5 shadow-[0_10px_30px_rgba(20,20,28,0.04)]">
      <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
        {label}
      </div>
      <div className="mt-3 text-[30px] font-light tracking-[-0.04em] text-[#14141C]">
        {value}
      </div>
      <div className="mt-1 text-[13px] text-[#5B5D6E]">{detail}</div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <WorkspaceSectionPage
      eyebrow="Overview"
      title="Workspace overview"
      description="A clean home for project work, task tracking, docs, meetings, chat, and files."
    >

    

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-6">
          <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
            Recent activity
          </div>
        
        </div>

        <div className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-6">
          <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
            Upcoming meetings
          </div>
          <div className="mt-4 space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.title}
                className="flex items-center justify-between rounded-[20px] border border-white bg-white px-4 py-3 shadow-[0_8px_20px_rgba(20,20,28,0.04)]"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-[16px] bg-[#EAFBF1] px-3 py-2 text-center text-[12px] font-medium leading-none text-[#065F46]">
                    <div>{meeting.date.split(" ")[0]}</div>
                    <div className="mt-1 text-[16px]">
                      {meeting.date.split(" ")[1]}
                    </div>
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-[#14141C]">
                      {meeting.title}
                    </div>
                    <div className="mt-1 text-[13px] text-[#5B5D6E]">
                      {meeting.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
              Recent documents
            </div>
          </div>
          <button className="rounded-full border border-[#DEDFE8] px-4 py-2 text-[13px] font-medium text-[#14141C] transition-colors hover:bg-white">
            View all documents
          </button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.label}
              className="rounded-[20px] border border-white bg-white p-4 shadow-[0_8px_20px_rgba(20,20,28,0.04)]"
            >
              <div className="text-[14px] font-medium text-[#14141C]">
                {doc.label}
              </div>
              <div className="mt-1 text-[13px] text-[#5B5D6E]">{doc.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceSectionPage>
  );
}
