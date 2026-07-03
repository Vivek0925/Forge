"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import {
  Folder,
  Video,
  MessageCircle,
  PenTool,
  Database,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

/* -------------------------------------------------------------------------
 * FORGE — Digital Engineering Workspace
 *
 * Note on type: the reference calls for a soft, rounded, geometric display
 * face for the headline (not the ultra-thin grotesque of the first pass).
 * Wire this up with next/font in your root layout, e.g.:
 *
 *   import { Poppins } from "next/font/google";
 *   const poppins = Poppins({ subsets: ["latin"], weight: ["200","300","400","600"], variable: "--font-display" });
 *
 * ...and reference it below as `font-[family-name:var(--font-display)]`,
 * or just set it as your Tailwind `font-sans` for the whole app.
 * ---------------------------------------------------------------------- */

const NAV_LINKS = ["Features", "Pricing", "Docs", "About"];



const FEATURES_DETAIL = [
  {
    index: "01",
    icon: Folder,
    title: "Project-first collaboration",
    description:
      "Every conversation, file and decision lives inside the project it belongs to — not scattered across a dozen tabs and threads.",
  },
  {
    index: "02",
    icon: Video,
    title: "Meetings inside projects",
    description:
      "Start a call without leaving your work. Meetings open next to the doc, the board and the code you already had open.",
  },
  {
    index: "03",
    icon: MessageCircle,
    title: "Real-time chat",
    description:
      "Threaded conversation attached to the work itself, so context never gets lost the moment a channel scrolls past it.",
  },
  {
    index: "04",
    icon: PenTool,
    title: "Collaborative whiteboard",
    description:
      "Sketch architecture, map a flow, or think out loud together — in the same space as the project it's for.",
  },
  {
    index: "05",
    icon: Database,
    title: "AI project memory",
    description:
      "Forge remembers every decision, thread and meeting, and can answer for the team the moment someone's away.",
  },
] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FCFCFF] text-[#0A0A0B] selection:bg-[#4F46E5] selection:text-white">
      <BackgroundWash />
      <Nav />
      <Hero />
      <FeaturesDetail />
      <ClosingCTA />
    </main>
  );
}

/* ------------------------------ Background ------------------------------ */

function BackgroundWash() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(1100px 700px at 85% 15%, rgba(129,110,247,0.14), transparent 60%), radial-gradient(900px 600px at 10% 60%, rgba(79,70,229,0.06), transparent 55%), #FCFCFF",
      }}
    />
  );
}

/* ---------------------------------- Nav ---------------------------------- */

function Logomark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#4F46E5" />
      <rect
        x="9"
        y="9"
        width="9"
        height="9"
        rx="2.5"
        fill="#4F46E5"
        fillOpacity="0.35"
      />
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "bg-[#FCFCFF]/80 backdrop-blur-md border-b border-black/[0.06]"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <Logomark />
          <span className="text-[14px] font-semibold tracking-[0.02em] text-[#0A0A0B]">
            FORGE
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="group relative text-[13.5px] text-[#52525B] transition-colors hover:text-[#0A0A0B]"
            >
              {link}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#4F46E5] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <a
          href="#"
          className="rounded-lg bg-[#4F46E5] px-4 py-2 text-[13.5px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] transition-colors hover:bg-[#4338CA]"
        >
          Get Started
        </a>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
      <motion.h1
        initial="hidden"
        animate="show"
        custom={0}
        variants={fadeUp}
        className="max-w-3xl text-center text-[54px] font-light leading-[1.1] tracking-[-0.01em] text-[#18181B] sm:text-[68px] md:text-[76px]"
      >
        Where Remote
        <br />
        Software Teams <span className="text-[#7C6FF2]">Build.</span>
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="show"
        custom={1}
        variants={fadeUp}
        className="mt-6 max-w-[420px] text-center text-[15px] leading-relaxed text-[#71717A]"
      >
        Forge brings everything your team needs into one project-first
        workspace.
      </motion.p>

      <motion.div
        initial="hidden"
        animate="show"
        custom={2}
        variants={fadeUp}
        className="mt-9 flex items-center gap-3"
      >
        <a
          href="#"
          className="rounded-lg bg-[#4F46E5] px-6 py-3 text-[14px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.55)] transition-colors hover:bg-[#4338CA]"
        >
          Get Started
        </a>
        <a
          href="#"
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-6 py-3 text-[14px] font-medium text-[#18181B] transition-colors hover:border-black/20"
        >
          <FaGithub className="h-4 w-4" />
          GitHub
        </a>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        custom={3}
        variants={fadeUp}
        className="mt-24 grid w-full max-w-5xl grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:grid-cols-5"
      >
      
      </motion.div>

      <ScrollHint />
    </section>
  );
}

function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1 }}
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
    >
      <span className="font-mono text-[10px] tracking-[0.2em] text-[#A1A1AA]">
        SCROLL TO EXPLORE
      </span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="h-4 w-4 text-[#A1A1AA]" strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------- Features -------------------------------- */

function FeaturesDetail() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="px-6 py-32 md:py-40">
      <div className="mx-auto max-w-3xl">
        <motion.p
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          custom={0}
          variants={fadeUp}
          className="mb-5 font-mono text-[11px] tracking-[0.25em] text-[#4F46E5]"
        >
          HOW IT COMES TOGETHER
        </motion.p>
        <motion.h2
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          custom={1}
          variants={fadeUp}
          className="max-w-xl text-[36px] font-light leading-[1.15] tracking-[-0.01em] text-[#18181B] md:text-[44px]"
        >
          Everything orbits the project.
        </motion.h2>

        <div className="mt-16 divide-y divide-black/[0.06] border-t border-black/[0.06]">
          {FEATURES_DETAIL.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              custom={i + 2}
              variants={fadeUp}
              className="group flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:gap-8"
            >
              <span className="font-mono text-[12px] text-[#C7C3FF] sm:w-8">
                {feature.index}
              </span>
              <feature.icon
                className="h-5 w-5 shrink-0 text-[#18181B] transition-colors duration-300 group-hover:text-[#4F46E5]"
                strokeWidth={1.4}
              />
              <h3 className="text-[16px] font-medium text-[#18181B] sm:w-64 sm:shrink-0">
                {feature.title}
              </h3>
              <p className="max-w-md text-[14px] leading-relaxed text-[#71717A]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Closing CTA ------------------------------- */

function ClosingCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="border-t border-black/[0.06] px-6 py-32 text-center md:py-40"
    >
      <motion.h2
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        custom={0}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-[34px] font-light leading-[1.2] tracking-[-0.01em] text-[#18181B] md:text-[42px]"
      >
        Stop switching tools.
        <br />
        Start building in one place.
      </motion.h2>
      <motion.div
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        custom={1}
        variants={fadeUp}
        className="mt-9 flex items-center justify-center gap-4"
      >
        <a
          href="#"
          className="flex items-center gap-2 rounded-lg bg-[#4F46E5] px-6 py-3 text-[14px] font-medium text-white shadow-[0_10px_24px_-8px_rgba(79,70,229,0.55)] transition-colors hover:bg-[#4338CA]"
        >
          Get Started
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.8} />
        </a>
        <a
          href="#"
          className="text-[14px] font-medium text-[#52525B] transition-colors hover:text-[#18181B]"
        >
          Talk to sales
        </a>
      </motion.div>
    </section>
  );
}
