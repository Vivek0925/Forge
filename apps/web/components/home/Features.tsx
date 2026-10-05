"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

type ShowcaseTab = "plan" | "meet" | "write";

const TABS: Array<{
  id: ShowcaseTab;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "plan",
    label: "Plan",
    title: "Turn ideas into a plan.",
    description: "Break a project into tasks and watch the work move across the board.",
  },
  {
    id: "meet",
    label: "Meet",
    title: "Talk it through, live.",
    description: "Start a call from the project and keep the chat right beside the work.",
  },
  {
    id: "write",
    label: "Write",
    title: "Write it down together.",
    description: "Draft docs side by side and see who is editing in real time.",
  },
];

function PlanPane() {
  return (
    <Window title="Sprint 12" badge="8 open">
      <div className="grid grid-cols-3 gap-3 bg-surface-secondary p-3.5">
        <BoardColumn title="To do">
          <TaskCard title="Write API docs" tag="Docs" variant="blue" />
          <TaskCard title="Design the nav" tag="UI" variant="coral" />
        </BoardColumn>
        <BoardColumn title="In progress">
          <TaskCard title="Auth flow" tag="Dev" variant="butter" />
          <TaskCard title="Prisma schema" tag="Dev" variant="butter" active />
          <span className="absolute left-[30%] top-[128px] rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">
            Arjun
          </span>
        </BoardColumn>
        <BoardColumn title="Done">
          <TaskCard title="Landing page" tag="UI" variant="coral" />
          <TaskCard title="Invite flow" tag="Dev" variant="butter" />
        </BoardColumn>
      </div>
    </Window>
  );
}

function MeetPane() {
  return (
    <Window title="Sprint planning" badge="Live">
      <div className="flex gap-3 px-4 py-3">
        {[
          ["V", "Vivek", "bg-peach-light"],
          ["P", "Priya", "bg-periwinkle-light"],
          ["A", "Arjun", "bg-sage"],
        ].map(([initial, name, color]) => (
          <div key={name} className={`grid h-10 w-10 place-items-center rounded-full text-xs font-semibold ${color}`}>
            <span>{initial}</span>
            <span className="sr-only">{name}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 px-4 pb-4 text-[13px]">
        <p className="mr-8 rounded-xl bg-surface-secondary px-3 py-2 text-muted">Roadmap looks good to me</p>
        <p className="ml-8 rounded-xl bg-blue-light px-3 py-2 text-ink">Shipping the beta Friday</p>
        <p className="mr-8 rounded-xl bg-surface-secondary px-3 py-2 text-muted">Nice, I&apos;ll update the docs</p>
        <div className="flex gap-1 pt-1">
          {[0, 1, 2, 3].map((dot) => (
            <i key={dot} className="h-1.5 w-1.5 rounded-full bg-coral" />
          ))}
        </div>
      </div>
    </Window>
  );
}

function WritePane() {
  return (
    <Window title="Docs" badge="3 editing">
      <article className="space-y-3 p-5">
        <h4 className="text-xl font-semibold tracking-[-0.03em]">API Documentation</h4>
        {[92, 78, 86].map((width) => (
          <div key={width} className="h-2 rounded-full bg-cream-border" style={{ width: `${width}%` }} />
        ))}
        <strong className="block pt-2 text-sm">Authentication</strong>
        <div className="relative rounded-lg bg-blue-light/60 p-2">
          <div className="h-2 w-full rounded-full bg-cream-border" />
          <span className="absolute -right-1 -top-3 rounded-md bg-ink px-2 py-0.5 text-[11px] font-semibold text-white">Priya</span>
        </div>
        {[70, 55].map((width) => (
          <div key={width} className="h-2 rounded-full bg-cream-border" style={{ width: `${width}%` }} />
        ))}
      </article>
    </Window>
  );
}

function Window({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cream-border bg-white text-[13px]">
      <div className="flex items-center gap-2 border-b border-cream-border px-4 py-2.5 font-semibold">
        {title}
        <span className="rounded-full bg-coral-soft px-2.5 py-0.5 text-xs text-coral-dark">{badge}</span>
      </div>
      {children}
    </div>
  );
}

function BoardColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-w-0 flex-col gap-2.5">
      <strong className="text-xs text-muted">{title}</strong>
      {children}
    </div>
  );
}

function TaskCard({
  title,
  tag,
  variant,
  active = false,
}: {
  title: string;
  tag: string;
  variant: "blue" | "coral" | "butter";
  active?: boolean;
}) {
  const tagClass = {
    blue: "bg-blue-light text-blue",
    coral: "bg-coral-soft text-coral-dark",
    butter: "bg-butter text-ink",
  }[variant];

  return (
    <div className={`flex min-h-[72px] flex-col justify-between gap-3 rounded-xl border border-cream-border bg-white p-3 font-semibold ${active ? "border-coral shadow-coral" : ""}`}>
      {title}
      <span className={`self-start rounded-md px-2 py-0.5 text-[11px] ${tagClass}`}>{tag}</span>
    </div>
  );
}

function ShowcasePane({ tab }: { tab: ShowcaseTab }) {
  if (tab === "plan") return <PlanPane />;
  if (tab === "meet") return <MeetPane />;
  return <WritePane />;
}

export default function Features() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("plan");
  const reducedMotion = useReducedMotion();
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];

  return (
    <section id="show" className="flex min-h-svh flex-col justify-center overflow-hidden bg-cream px-5 py-[100px] sm:px-8 md:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <motion.div
          className="mb-7 flex flex-wrap items-end justify-between gap-8"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="text-[clamp(40px,5.4vw,80px)] font-bold leading-[0.94] tracking-[-0.05em] text-ink">
            From idea
            <br />
            <span className="font-light">to shipped.</span>
          </h2>
          <p className="mb-1 max-w-[26em] text-[17px] text-muted">
            Plan the work, talk it through and write it down without leaving the project.
          </p>
        </motion.div>

        <div className="mb-5 flex gap-2.5" role="tablist" aria-label="Vynor platform">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              id={`showcase-tab-${tab.id}`}
              aria-controls={`showcase-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-5 py-2.5 text-[15px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-ink bg-ink text-text-warm"
                  : "border-ink/30 bg-transparent text-ink hover:bg-ink/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          className="grid min-h-[440px] overflow-hidden rounded-[28px] border border-ink/15 md:grid-cols-[0.8fr_1.2fr]"
          initial={reducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="flex flex-col justify-between gap-6 bg-sage p-6 sm:p-11">
            <div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-[clamp(28px,3vw,44px)] font-bold leading-none tracking-[-0.05em] text-ink">
                    {active.title}
                  </h3>
                          <p className="mt-3 max-w-[24em] text-[17px] text-sage-text">{active.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <a href="/login" className="flex items-center justify-between rounded-md bg-ink px-[22px] py-[15px] text-[15px] font-semibold text-text-warm transition-transform hover:-translate-y-0.5">
              Start a project
              <ArrowUpRight className="h-[1.2em] w-[1.2em]" strokeWidth={1.8} />
            </a>
          </div>

          <div className="flex items-center bg-surface-secondary p-4 sm:p-9">
            <div id={`showcase-${active.id}`} className="w-full" role="tabpanel" aria-labelledby={`showcase-tab-${active.id}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <ShowcasePane tab={active.id} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
