"use client";

import { motion } from "framer-motion";
import Section from "../ui/Section";

const STEPS = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Spin up a workspace for what you're actually building, not another channel or board.",
  },
  {
    number: "02",
    title: "Invite your team",
    description:
      "Everyone lands in the same place, with chat, docs, and tasks already connected.",
  },
  {
    number: "03",
    title: "Work in one place",
    description:
      "Meetings, decisions, and files stay linked automatically as the project moves forward.",
  },
];

export default function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="How it works"
      title="From new project to shipped, in one flow"
      className="bg-[#F3F3F6]"
    >
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative"
          >
            <span className="font-mono text-[13px] tracking-[0.1em] text-[#059669]">
              {step.number}
            </span>
            <p className="mt-4 text-[19px] font-medium text-[#14141C]">
              {step.title}
            </p>
            <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-[#5B5D6E]">
              {step.description}
            </p>

            {i < STEPS.length - 1 && (
              <div className="absolute right-[-16px] top-[6px] hidden h-px w-8 bg-[#DEDFE8] md:block" />
            )}
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
