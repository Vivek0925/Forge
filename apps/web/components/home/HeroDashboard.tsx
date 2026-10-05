"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { CheckSquare, MessageSquare } from "lucide-react";

const NAV_ITEMS = ["Overview", "Projects", "Tasks", "Docs", "Whiteboard", "Chat", "Meetings"];

const ACTIVITY = [
  { color: "bg-peach", text: "You updated API Documentation.md" },
  { color: "bg-periwinkle", text: "Priya created a new task" },
  { color: "bg-mint", text: "Arjun joined the workspace" },
];

export default function HeroDashboard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), {
    stiffness: 180,
    damping: 24,
  });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      ref={stageRef}
      className="relative [perspective:1200px]"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <motion.div
        className="relative [transform-style:preserve-3d]"
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ rotateX, rotateY }}
        transition={{ duration: 1.1, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="grid overflow-hidden rounded-[20px] bg-white text-ink shadow-[0_24px_70px_rgba(23,32,26,0.18)] md:grid-cols-[150px_1fr]">
          <aside className="hidden flex-col gap-1 bg-surface-secondary p-5 text-[13px] text-muted md:flex">
            <strong className="mb-2 text-[15px] text-ink">desizn</strong>
            {NAV_ITEMS.map((item, index) => (
              <span
                key={item}
                className={`rounded-lg px-2.5 py-1.5 ${index === 0 ? "bg-coral-soft font-semibold text-coral-dark" : ""}`}
              >
                {item}
              </span>
            ))}
          </aside>

          <div className="p-5 text-[13px] sm:p-[22px]">
            <h3 className="mb-3.5 text-xl font-semibold tracking-[-0.03em]">Good afternoon, Vivek</h3>
            <div className="mb-4 grid grid-cols-3 gap-2.5">
              {[
                ["Projects", "3"],
                ["Open tasks", "8"],
                ["Members", "6"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-cream-border px-2.5 py-2.5 text-muted">
                  <span>{label}</span>
                  <strong className="block text-[26px] leading-[1.1] tracking-[-0.04em] text-ink">{value}</strong>
                </div>
              ))}
            </div>

            <div className="text-muted">
              {ACTIVITY.map((item) => (
                <p key={item.text} className="m-0 flex items-center gap-2.5 py-1.5">
                  <i className={`h-5 w-5 shrink-0 rounded-full ${item.color}`} />
                  {item.text}
                </p>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-cream-border bg-cream-panel px-3.5 py-3 font-semibold">
              <span>Sprint Planning, 10:00 AM</span>
              <span className="rounded-lg bg-coral px-3.5 py-1.5 text-white">Join</span>
            </div>
          </div>
        </div>

        <span className="absolute -left-3 -top-5 flex items-center gap-2 whitespace-nowrap rounded-lg bg-text-warm px-3.5 py-2.5 text-[13px] font-medium text-ink shadow-lg md:-left-6">
          <MessageSquare className="h-4 w-4" strokeWidth={1.8} />
          Standup notes filed
        </span>
        <span className="absolute -bottom-5 right-0 flex items-center gap-2 whitespace-nowrap rounded-lg bg-text-warm px-3.5 py-2.5 text-[13px] font-medium text-ink shadow-lg md:-right-3">
          <CheckSquare className="h-4 w-4" strokeWidth={1.8} />
          Sprint task moved to Done
        </span>
      </motion.div>
    </div>
  );
}
