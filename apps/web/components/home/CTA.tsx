"use client";

import { motion } from "framer-motion";
import Container from "../ui/Container";
import Button from "../ui/Button";

export default function CTA() {
  return (
    <section className="py-24 md:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[32px] bg-[#14141C] px-8 py-16 text-center md:px-16 md:py-20"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#059669]/25 blur-[90px]" />

          <span className="relative font-mono text-[11px] uppercase tracking-[0.22em] text-[#6EE7B7]">
            Now in private beta
          </span>
          <h2 className="relative mx-auto mt-5 max-w-[520px] text-[32px] font-light leading-[1.15] tracking-[-0.01em] text-[#FAFAF8] md:text-[42px]">
            Give your team back their focus
          </h2>
          <p className="relative mx-auto mt-4 max-w-[420px] text-[15px] leading-relaxed text-[#B4B5C6]">
            Bring your next project into Forge and see what your team builds
            when nothing gets lost between tools.
          </p>
          <div className="relative mt-8 flex items-center justify-center gap-3">
            <Button className="bg-[#FAFAF8] text-[#14141C] hover:bg-[#EDEEF3]">
              Join the beta
            </Button>
            <Button variant="ghost" className="text-[#FAFAF8] hover:bg-white/10">
              Talk to the team
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
