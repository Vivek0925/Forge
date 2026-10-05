"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, FileText, KanbanSquare, MessageSquare, Video } from "lucide-react";

const TOOLS = [
  { label: "Chat", angle: 0, icon: MessageSquare },
  { label: "Tasks", angle: 72, icon: KanbanSquare },
  { label: "Docs", angle: 144, icon: FileText },
  { label: "Board", angle: 216, icon: KanbanSquare },
  { label: "Meet", angle: 288, icon: Video },
];

const STEPS = [
  {
    number: "1",
    title: "Gather your tools",
    description: "Chat, tasks, docs and boards start in the same project.",
  },
  {
    number: "2",
    title: "Connect the dots",
    description: "Link a task to the doc and the call where it was decided.",
  },
  {
    number: "3",
    title: "Ship together",
    description: "Everyone sees the same progress, live, in one place.",
  },
];

function ToolOrbit() {
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="relative mx-auto h-[min(440px,88vw)] w-[min(440px,88vw)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Vynor connects chat, tasks, docs, board, and meetings"
      role="img"
    >
      <div className="absolute inset-0 rounded-full border border-white/45 opacity-50" />
      <div className="absolute inset-16 rounded-full border border-white/45" />

      <motion.div
        className="absolute inset-0"
        animate={reducedMotion || paused ? undefined : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {TOOLS.map(({ label, angle, icon: Icon }) => (
          <div
            key={label}
            className="absolute left-1/2 top-1/2 h-[76px] w-[76px] -ml-[38px] -mt-[38px]"
            style={{
              transform: `rotate(${angle}deg) translateY(-168px) rotate(${-angle}deg)`,
            }}
          >
            <motion.div
              className="grid h-full w-full place-items-center content-center gap-0.5 rounded-[20px] bg-white text-center text-xs font-semibold text-blue"
              animate={reducedMotion || paused ? undefined : { rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="h-[26px] w-[26px]" strokeWidth={1.8} />
              {label}
            </motion.div>
          </div>
        ))}
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 grid h-24 w-24 -ml-12 -mt-12 place-items-center rounded-full bg-butter text-[40px] font-bold text-ink"
        initial={reducedMotion ? false : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.2, 0.9, 0.3, 1.3] }}
      >
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-butter"
          animate={reducedMotion ? undefined : { scale: [1, 2.3], opacity: [0.8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />
        <span className="relative">V</span>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="how" className="flex min-h-svh flex-col justify-center overflow-hidden bg-blue px-5 py-[100px] text-white sm:px-8 md:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-[clamp(24px,5vw,72px)]">
          <div>
            <motion.h2
              className="text-[clamp(40px,5.4vw,80px)] font-bold leading-[0.94] tracking-[-0.05em]"
              initial={reducedMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8 }}
            >
              <span className="font-light">Five tools.</span>
              <br />
              One core.
            </motion.h2>
            <motion.p
              className="my-6 mb-8 max-w-[30em] text-[clamp(16px,1.4vw,20px)] leading-[1.45] text-blue-light"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.12 }}
            >
              Everything your team uses connects around the project, so nothing gets lost between apps.
            </motion.p>
            <motion.div
              className="text-[15px] text-blue-light"
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.22 }}
            >
              Replaces
              {["Slack", "Notion", "Jira", "Miro"].map((tool) => (
                <s key={tool} className="ml-3 decoration-butter decoration-2">
                  {tool}
                </s>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, scale: 0.86 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <ToolOrbit />
          </motion.div>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-[clamp(16px,3vw,48px)]">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              className="grid grid-cols-[32px_1fr_24px] gap-x-2.5 gap-y-1.5 border-t border-white/40 pt-[18px]"
              initial={reducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <i className="pt-1 text-sm not-italic opacity-70">{step.number}</i>
              <b className="text-[21px] leading-tight tracking-[-0.03em]">{step.title}</b>
              <ArrowUpRight className="h-5 w-5" strokeWidth={1.8} />
              <p className="col-start-2 m-0 text-[15px] text-blue-light">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
