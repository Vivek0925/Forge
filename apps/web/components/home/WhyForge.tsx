"use client";

import { motion } from "framer-motion";
import Section from "../ui/Section";

const SCATTERED = [
  "Slack",
  "Google Meet",
  "Notion",
  "Jira",
  "Miro",
  "Google Drive",
  "ChatGPT",
];

const UNIFIED = [
  "Chat",
  "Meetings",
  "Documentation",
  "Whiteboard",
  "Tasks",
  "Files",
  "AI Memory",
];

export default function WhyForge() {
  return (
    <Section
      id="why-forge"
      eyebrow="Why Forge"
      title="Stop stitching your workflow together"
      description="Forge isn't another Slack clone, Discord clone, or Notion clone. It's not another tab. It's the one your team actually lives in."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#DEDFE8] bg-[#F3F3F6] p-8 md:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8A8CA0]">
            Without Forge
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {SCATTERED.map((tool, i) => (
              <motion.span
                key={tool}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-full border border-[#DEDFE8] bg-[#FAFAF8] px-4 py-2 text-[13px] text-[#8A8CA0] line-through decoration-[#C7C9DA]"
              >
                {tool}
              </motion.span>
            ))}
          </div>
          <p className="mt-8 text-[14px] leading-relaxed text-[#8A8CA0]">
            Seven tabs, seven logins, and context that never quite makes it from
            one tool to the next.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[#14141C] bg-[#14141C] p-8 md:p-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#059669]/20 blur-[70px]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6EE7B7]">
            With Forge
          </p>
          <div className="relative mt-6 flex flex-wrap gap-2.5">
            {UNIFIED.map((tool, i) => (
              <motion.span
                key={tool}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-full bg-[#FAFAF8] px-4 py-2 text-[13px] font-medium text-[#14141C]"
              >
                {tool}
              </motion.span>
            ))}
          </div>
          <p className="relative mt-8 text-[14px] leading-relaxed text-[#B4B5C6]">
            One project. One workspace. Everything connected, and nothing lost
            between tools.
          </p>
        </div>
      </div>
    </Section>
  );
}
