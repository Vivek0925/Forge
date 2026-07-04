"use client";

import { motion } from "framer-motion";
import Container from "../ui/Container";
import Button from "../ui/Button";

const NODES = [
  { label: "Chat", angle: -90 },
  { label: "Meetings", angle: -45 },
  { label: "Docs", angle: 0 },
  { label: "Whiteboard", angle: 45 },
  { label: "Tasks", angle: 90 },
  { label: "Files", angle: 135 },
  { label: "AI Memory", angle: 180 },
  { label: "Timeline", angle: -135 },
];

const CENTER = { x: 260, y: 260 };
const RADIUS = 190;

function point(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(rad),
    y: CENTER.y + RADIUS * Math.sin(rad),
  };
}

function ConnectionGraph() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* ambient blobs */}
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#059669]/15 blur-[80px]" />
      <div className="absolute left-1/3 top-1/4 h-[220px] w-[220px] rounded-full bg-[#065F46]/10 blur-[70px]" />

      <svg viewBox="0 0 520 520" className="relative h-full w-full">
        {NODES.map((node, i) => {
          const p = point(node.angle);
          return (
            <motion.line
              key={`line-${node.label}`}
              x1={CENTER.x}
              y1={CENTER.y}
              x2={p.x}
              y2={p.y}
              stroke="#C7C9DA"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.15 + i * 0.06, ease: "easeOut" }}
            />
          );
        })}

        {NODES.map((node, i) => {
          const p = point(node.angle);
          return (
            <motion.circle
              key={`pulse-${node.label}`}
              r={3}
              fill="#059669"
              initial={{ opacity: 0 }}
              animate={{
                cx: [CENTER.x, p.x],
                cy: [CENTER.y, p.y],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2.2,
                delay: 1 + i * 0.35,
                repeat: Infinity,
                repeatDelay: NODES.length * 0.35,
                ease: "easeInOut",
              }}
            />
          );
        })}

        {NODES.map((node, i) => {
          const p = point(node.angle);
          return (
            <motion.g
              key={node.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.06 }}
            >
              <circle cx={p.x} cy={p.y} r={26} fill="#FAFAF8" stroke="#DEDFE8" strokeWidth={1} />
              <text
                x={p.x}
                y={p.y + 42}
                textAnchor="middle"
                className="fill-[#5B5D6E]"
                style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, letterSpacing: "0.04em" }}
              >
                {node.label.toUpperCase()}
              </text>
            </motion.g>
          );
        })}

        {/* center hub */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <circle cx={CENTER.x} cy={CENTER.y} r={46} fill="#14141C" />
          <text
            x={CENTER.x}
            y={CENTER.y + 4}
            textAnchor="middle"
            className="fill-[#FAFAF8]"
            style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.08em" }}
          >
            FORGE
          </text>
        </motion.g>
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40 md:pb-32 md:pt-48">
      <Container className="grid items-center gap-16 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col items-start gap-7">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
            The digital engineering workspace
          </span>

          <h1 className="text-[42px] font-light leading-[1.08] tracking-[-0.02em] text-[#14141C] md:text-[58px]">
            Every project,
            <br />
            one connected place.
          </h1>

          <p className="max-w-[440px] text-[16px] leading-relaxed text-[#5B5D6E]">
            Forge replaces the sprawl of Slack, Meet, Notion, Jira, Miro, Drive,
            and ChatGPT with a single workspace built around your projects, not
            your inbox.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Button>Join the beta</Button>
            <Button variant="ghost">See how it works</Button>
          </div>
        </div>

        <ConnectionGraph />
      </Container>
    </section>
  );
}
