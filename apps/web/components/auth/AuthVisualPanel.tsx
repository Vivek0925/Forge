"use client";

import { motion } from "framer-motion";

const NODES = [
  { label: "Chat", angle: -90 },
  { label: "Docs", angle: -18 },
  { label: "Tasks", angle: 54 },
  { label: "Files", angle: 126 },
  { label: "AI Memory", angle: 198 },
  { label: "Meetings", angle: 270 },
];

const CENTER = { x: 200, y: 200 };
const RADIUS = 140;

function point(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + RADIUS * Math.cos(rad),
    y: CENTER.y + RADIUS * Math.sin(rad),
  };
}

export default function AuthVisualPanel() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-[#111111] p-12 lg:flex">
      {/* ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[90px]" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white">
          <span className="h-[9px] w-[9px] rounded-[2px] bg-primary" />
        </span>
        <span className="text-[15px] font-medium tracking-tight text-white">
          Forge
        </span>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[400px]">
        <svg viewBox="0 0 400 400" className="h-full w-full">
          {NODES.map((node, i) => {
            const p = point(node.angle);
            return (
              <motion.line
                key={`line-${node.label}`}
                x1={CENTER.x}
                y1={CENTER.y}
                x2={p.x}
                y2={p.y}
                stroke="rgba(255,255,255,0.14)"
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.06 }}
              />
            );
          })}

          {NODES.map((node, i) => {
            const p = point(node.angle);
            return (
              <motion.circle
                key={`pulse-${node.label}`}
                r={2.5}
                fill="#22c55e"
                initial={{ opacity: 0 }}
                animate={{
                  cx: [CENTER.x, p.x],
                  cy: [CENTER.y, p.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: 0.8 + i * 0.3,
                  repeat: Infinity,
                  repeatDelay: NODES.length * 0.3,
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
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
              >
                <circle cx={p.x} cy={p.y} r={20} fill="#1a1a1a" stroke="rgba(255,255,255,0.14)" />
                <text
                  x={p.x}
                  y={p.y + 34}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 9, letterSpacing: "0.05em" }}
                >
                  {node.label.toUpperCase()}
                </text>
              </motion.g>
            );
          })}

          <circle cx={CENTER.x} cy={CENTER.y} r={38} fill="#22c55e" />
          <text
            x={CENTER.x}
            y={CENTER.y + 4}
            textAnchor="middle"
            fill="#111111"
            style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, letterSpacing: "0.06em", fontWeight: 600 }}
          >
            FORGE
          </text>
        </svg>
      </div>

      <div className="relative max-w-[340px]">
        <p className="text-[20px] font-light leading-snug text-white">
          &ldquo;Every project, one connected place.&rdquo;
        </p>
        <p className="mt-3 text-[13px] text-white/40">
          Chat, docs, tasks, and meetings — finally in one workspace.
        </p>
      </div>
    </div>
  );
}
