import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Navbar } from "@/components/layout";

const recentWorkspaces: Array<{
  name: string;
  status: string;
  updatedAt: string;
  members: string;
  accent: string;
}> = [];

function EmptyState() {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[#C7C9DA] bg-[#FAFAF8]/80 px-6 py-8 text-center shadow-[var(--shadow-sm)]">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECEDF3]">
        <span className="h-3 w-3 rounded-[4px] bg-[#059669]" />
      </div>
      <h3 className="text-[15px] font-medium text-[#14141C]">
        No workspace history yet
      </h3>
      <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-[#5B5D6E]">
        Once you create your first workspace, it will appear here with recent
        activity, members, and the last time it was updated.
      </p>
    </div>
  );
}

export const metadata = {
  title: "Dashboard | Forge",
  description:
    "Manage workspaces, launch a quick meeting room, and review recent project activity.",
};

export default function Dashboard() {
  return (
    <main className="relative min-h-screen bg-[#F8F8F6] text-[#14141C]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-[-8rem] top-0 h-[24rem] w-[24rem] rounded-full bg-[#059669]/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[10rem] h-[18rem] w-[18rem] rounded-full bg-[#065F46]/10 blur-[90px]" />

      <Container>
        <header className="flex items-center justify-between gap-4 border-b border-[#DEDFE8]/40 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
            </span>
            <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
              Forge
            </span>
          </Link>
        </header>
      </Container>

      {/* Hero Section - Google Meet Style */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-20">
        <Container>
          <div className="flex flex-col items-center justify-center text-center">
            {/* Title */}
            <h1 className="max-w-[800px] text-[48px] font-light leading-[1.15] tracking-[-0.03em] text-[#14141C] md:text-[64px] lg:text-[72px]">
              Workspace, meetings, and collaboration in one place
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-[580px] text-[16px] leading-[1.6] text-[#5B5D6E] md:text-[18px]">
              Create a workspace for your project, jump into a quick meeting, or
              join one using a code. Everything connected and ready to go.
            </p>

            {/* Action Buttons - Google Meet Style */}
            <div className="mt-12 flex w-full max-w-[600px] flex-col items-center gap-4 sm:flex-row sm:gap-3">
              <Button
                size="md"
                className="flex-1 rounded-full px-8 py-3 text-black text-[16px] font-medium"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create workspace
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="flex-1 rounded-full border-2 border-[#DEDFE8] bg-transparent px-8 py-3 text-[16px] font-medium text-[#14141C] hover:bg-[#FAFAF8]"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick meeting
              </Button>
            </div>

            {/* Input Section - Enter code */}
            <div className="mt-8 w-full max-w-[500px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a code or meeting link"
                  className="flex-1 rounded-full border-2 border-[#DEDFE8] bg-white px-6 py-3 text-[14px] placeholder-[#5B5D6E] transition-all focus:border-[#059669] focus:outline-none"
                />
                <button className="rounded-full bg-[#FAFAF8] px-6 py-3 text-[14px] font-medium text-[#5B5D6E] transition-all hover:bg-[#DEDFE8]">
                  Join
                </button>
              </div>
            </div>

            {/* Illustration placeholder - simple gradient circle with icon */}
            <div className="mt-16 flex items-center justify-center">
              <div className="relative h-[280px] w-[280px] rounded-full bg-gradient-to-br from-[#059669]/20 to-[#065F46]/10 p-8">
                <svg
                  viewBox="0 0 200 200"
                  className="h-full w-full text-[#059669]/30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="100" cy="100" r="80" />
                  <circle cx="100" cy="100" r="60" />
                  <circle cx="100" cy="100" r="40" />
                  <circle cx="65" cy="80" r="18" />
                  <circle cx="135" cy="80" r="18" />
                  <path d="M 70 120 Q 100 140 130 120" strokeLinecap="round" />
                  <circle cx="100" cy="50" r="8" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Workspace History Section */}
      <section className="border-t border-[#DEDFE8]/40 bg-[#FAFAF8]/40 py-20">
        <Container>
          <div className="mb-12 flex flex-col items-start gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
              Workspace history
            </span>
            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
              <h2 className="text-[36px] font-light tracking-[-0.02em] text-[#14141C]">
                Recent workspaces
              </h2>
              <p className="text-[14px] leading-relaxed text-[#5B5D6E]">
                Create your first workspace to see recent activity here.
              </p>
            </div>
          </div>

          {recentWorkspaces.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentWorkspaces.map((workspace) => (
                <article
                  key={workspace.name}
                  className="rounded-[28px] border border-[#DEDFE8] bg-white p-5 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${workspace.accent}`}
                      />
                      <h3 className="mt-4 text-[17px] font-medium tracking-[-0.02em] text-[#14141C]">
                        {workspace.name}
                      </h3>
                      <p className="mt-1 text-[13px] text-[#5B5D6E]">
                        {workspace.members}
                      </p>
                    </div>
                    <span className="rounded-full border border-[#DEDFE8] px-3 py-1 text-[12px] text-[#5B5D6E]">
                      {workspace.status}
                    </span>
                  </div>

                  <div className="mt-6 border-t border-[#DEDFE8] pt-4 text-[12px] text-[#5B5D6E]">
                    Updated {workspace.updatedAt}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
      
    </main>
  );
}
