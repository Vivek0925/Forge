"use client";

import { motion } from "framer-motion";
import Container from "../ui/Container";
import Button from "../ui/Button";
import Link from "next/dist/client/link";

export default function CTA() {
  return (
    <section className="py-16 sm:py-24 md:py-28">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[24px] bg-[#14141C] px-5 py-12 text-center sm:rounded-[32px] sm:px-8 sm:py-16 md:px-16 md:py-20"
        >
          <div className="pointer-events-none absolute left-1/2 top-0 h-[260px] w-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#059669]/25 blur-[90px]" />

          <span className="relative font-mono text-[11px] uppercase tracking-[0.22em] text-[#6EE7B7]">
            Now in private beta
          </span>
          <h2 className="relative mx-auto mt-5 max-w-[520px] text-[28px] font-light leading-[1.15] tracking-[-0.01em] text-[#FAFAF8] sm:text-[32px] md:text-[42px]">
            Give your team back their focus
          </h2>
          <p className="relative mx-auto mt-4 max-w-[420px] text-[15px] leading-relaxed text-[#B4B5C6]">
            Bring your next project into Vynor and see what your team builds
            when nothing gets lost between tools.
          </p>
          <div className="relative mx-auto mt-8 flex w-full max-w-[280px] flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Link href="/login">
              <Button className=" text-[#14141C] hover:bg-white/10">
                Join the beta
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="ghost" className="text-[#FAFAF8] hover:bg-white/10">
                Talk to the team
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
