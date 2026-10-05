"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Container from "../ui/Container";
import HeroDashboard from "./HeroDashboard";

export default function Hero() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-coral px-5 pb-[104px] pt-[120px] text-text-warm sm:px-8 md:px-16">
      <Container className="grid w-full max-w-[1280px] items-center gap-12 md:grid-cols-2 md:gap-[clamp(24px,5vw,72px)]">
        <div>
          <h1 className="m-0 text-[clamp(52px,7.6vw,116px)] font-bold leading-[0.94] tracking-[-0.05em]">
            <motion.span
              className="block"
              initial={reducedMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            >
              Tools in.
            </motion.span>
            <motion.span
              className="block"
              initial={reducedMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
            >
              Product out.
            </motion.span>
          </h1>

          <motion.p
            className="my-6 mb-8 max-w-[30em] text-[clamp(16px,1.4vw,20px)] leading-[1.45] text-text-warm/90"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          >
            Chat, tasks, docs, whiteboards and meetings in one calm place where your team builds.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-5"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Link href="/login" className="inline-flex items-center gap-3 rounded-md bg-butter px-[22px] py-[15px] text-[15px] font-semibold text-ink transition-transform hover:-translate-y-0.5">
              Start building
              <ArrowUpRight className="h-[1.2em] w-[1.2em]" strokeWidth={1.8} />
            </Link>
            <a href="#features" className="transition-opacity hover:opacity-75">
              See Vynor in action
            </a>
          </motion.div>

          <motion.div
            className="mt-8 flex items-center gap-3 text-sm text-text-warm/90"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="flex text-coral">
              <i className="h-[26px] w-[26px] rounded-full border-2 border-current bg-peach" />
              <i className="-ml-2 h-[26px] w-[26px] rounded-full border-2 border-current bg-periwinkle" />
              <i className="-ml-2 h-[26px] w-[26px] rounded-full border-2 border-current bg-mint" />
            </span>
            Made for software teams, designers and students
          </motion.div>
        </div>

        <HeroDashboard />
      </Container>

      <div className="absolute bottom-6 left-5 right-5 flex justify-between border-t border-text-warm/45 pt-3.5 text-sm text-text-warm/90 sm:left-8 sm:right-8 md:left-16 md:right-16">
        <span>Meet Vynor</span>
        <span>Scroll to go deeper</span>
      </div>
    </section>
  );
}
