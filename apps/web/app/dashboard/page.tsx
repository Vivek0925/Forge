import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

const recentWorkspaces: Array<{
  name: string;
  status: string;
  updatedAt: string;
  members: string;
  accent: string;
}> = [];

const focusAreas = ["Chat", "Meetings", "Docs", "Tasks", "Files", "AI Memory"];

function WorkspaceGlyph() {
  return (
    <svg viewBox="0 0 420 420" className="h-full w-full" aria-hidden="true">
      <circle cx="210" cy="210" r="150" fill="#059669" opacity="0.12" />
      <circle
        cx="210"
        cy="210"
        r="108"
        fill="#FAFAF8"
        stroke="#DEDFE8"
        strokeWidth="1.25"
      />
      <circle cx="210" cy="210" r="36" fill="#14141C" />
      <text
        x="210"
        y="215"
        textAnchor="middle"
        className="fill-[#FAFAF8]"
        style={{
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 11,
          letterSpacing: "0.16em",
        }}
      >
        HUB
      </text>

      {focusAreas.map((label, index) => {
        const angle = (-90 + index * 60) * (Math.PI / 180);
        const x = 210 + 135 * Math.cos(angle);
        const y = 210 + 135 * Math.sin(angle);

        return (
          <g key={label}>
            <circle
              cx={x}
              cy={y}
              r="23"
              fill="#FAFAF8"
              stroke="#C7C9DA"
              strokeWidth="1"
            />
            <text
              x={x}
              y={y + 38}
              textAnchor="middle"
              className="fill-[#5B5D6E]"
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 9,
                letterSpacing: "0.06em",
              }}
            >
              {label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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
    <main className="relative min-h-screen overflow-hidden bg-[#F8F8F6] pb-20 pt-8 text-[#14141C]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#059669]/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[18rem] h-[18rem] w-[18rem] rounded-full bg-[#065F46]/10 blur-[90px]" />

      <Container>
        <header className="flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
              <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
            </span>
            <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
              Forge
            </span>
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-[#DEDFE8] bg-[#FAFAF8]/90 px-3 py-2 text-[12px] text-[#5B5D6E] shadow-[var(--shadow-sm)] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            Ready for your next workspace
          </div>
        </header>

        <section className="grid items-center gap-12 pb-16 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20 lg:pt-20">
          <div className="flex flex-col items-start gap-7">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
              Workspace dashboard
            </span>

            <div className="space-y-4">
              <h1 className="max-w-[11ch] text-[42px] font-light leading-[1.06] tracking-[-0.03em] text-[#14141C] md:text-[60px]">
                One place to start, meet, and ship.
              </h1>
              <p className="max-w-[520px] text-[16px] leading-relaxed text-[#5B5D6E]">
                Spin up a workspace for a project, jump into a quick meeting
                room, and keep the history of everything you build in one
                connected view.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="md" className="min-w-[170px]">
                Create workspace
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="min-w-[170px] border border-[#DEDFE8] bg-[#FAFAF8]"
              >
                Quick meeting room
              </Button>
            </div>

            <div className="grid w-full max-w-[560px] grid-cols-2 gap-3 pt-3 sm:grid-cols-3">
              {[
                {
                  label: "Open workspaces",
                  value: "0",
                  note: "Create your first hub",
                },
                {
                  label: "Meeting rooms",
                  value: "1",
                  note: "Quick launch ready",
                },
                {
                  label: "Connected tools",
                  value: "6",
                  note: "Chat, docs, tasks, and more",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-md)] border border-[#DEDFE8] bg-[#FAFAF8]/90 p-4 shadow-[var(--shadow-sm)]"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#5B5D6E]">
                    {item.label}
                  </div>
                  <div className="mt-2 text-[28px] font-light tracking-[-0.03em] text-[#14141C]">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-[#5B5D6E]">
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[40px] bg-[#FAFAF8]/75 blur-2xl" />
            <div className="rounded-[40px] border border-[#DEDFE8] bg-[#FAFAF8]/90 p-5 shadow-[var(--shadow-lg)] backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-[#DEDFE8] pb-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#059669]">
                    Project hub
                  </div>
                  <h2 className="mt-2 text-[18px] font-medium tracking-[-0.02em] text-[#14141C]">
                    Forge workspace command center
                  </h2>
                </div>
                <div className="rounded-full border border-[#DEDFE8] bg-white px-3 py-1 text-[12px] text-[#5B5D6E]">
                  Live
                </div>
              </div>

              <div className="grid gap-6 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                <div className="rounded-[32px] border border-[#DEDFE8] bg-white p-5 shadow-[var(--shadow-sm)]">
                  <div className="aspect-square w-full max-w-[300px]">
                    <WorkspaceGlyph />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Create a workspace",
                      copy: "Start with a project name, invite your team, and Forge will assemble the shared space.",
                    },
                    {
                      title: "Quick meeting room",
                      copy: "Open a lightweight room for standups, reviews, or ad hoc calls without leaving the dashboard.",
                    },
                    {
                      title: "Connected timeline",
                      copy: "Once workspaces exist, their recent activity appears here with members, status, and updates.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-[15px] font-medium text-[#14141C]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-[13px] leading-relaxed text-[#5B5D6E]">
                            {item.copy}
                          </p>
                        </div>
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#059669]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
                Workspace history
              </span>
              <h2 className="mt-2 text-[24px] font-light tracking-[-0.02em] text-[#14141C]">
                Recent workspaces
              </h2>
            </div>
            <p className="hidden max-w-[420px] text-right text-[13px] leading-relaxed text-[#5B5D6E] md:block">
              This section stays empty until you create your first workspace,
              then it becomes the quick way back into active projects.
            </p>
          </div>

          {recentWorkspaces.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentWorkspaces.map((workspace) => (
                <article
                  key={workspace.name}
                  className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8]/95 p-5 shadow-[var(--shadow-sm)] transition-transform duration-200 hover:-translate-y-0.5"
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
        </section>
      </Container>
    </main>
  );
}
