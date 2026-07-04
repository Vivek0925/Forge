"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Video,
  FileText,
  PenTool,
  CheckSquare,
  Folder,
  Brain,
  Activity,
  LucideIcon,
} from "lucide-react";
import Section from "../ui/Section";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Threaded, project-scoped conversations that never lose context.",
  },
  {
    icon: Video,
    title: "Meetings",
    description: "Video calls that transcribe themselves into project memory.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Living docs that stay linked to the code and tasks they describe.",
  },
  {
    icon: PenTool,
    title: "Whiteboard",
    description: "Sketch architecture and flows without leaving the project.",
  },
  {
    icon: CheckSquare,
    title: "Tasks",
    description: "Issues and sprints tied directly to the discussion that created them.",
  },
  {
    icon: Folder,
    title: "Files",
    description: "One source of truth for every asset your team touches.",
  },
  {
    icon: Brain,
    title: "AI Memory",
    description: "An assistant that remembers every decision your project has made.",
  },
  {
    icon: Activity,
    title: "Activity Timeline",
    description: "A single history of everything that happened, and why.",
  },
];

export default function Features() {
  return (
    <Section
      id="features"
      eyebrow="Inside every project"
      title="One project, everything connected"
      description="No more piecing together what happened across seven different tools. Every surface your team needs lives inside the same project."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
            className="group rounded-2xl border border-[#DEDFE8] bg-[#FAFAF8] p-6 transition-colors hover:border-[#059669]/40 hover:bg-[#F3F3FF]"
          >
            <feature.icon
              className="h-5 w-5 text-[#059669]"
              strokeWidth={1.5}
            />
            <p className="mt-5 text-[15px] font-medium text-[#14141C]">
              {feature.title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#8A8CA0]">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
