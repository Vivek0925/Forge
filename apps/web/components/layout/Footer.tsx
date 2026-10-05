"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const FOOTER_LINKS = [
  { label: "Platform", href: "#show" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#price" },
  { label: "Privacy", href: "#top" },
  { label: "Terms", href: "#top" },
];

export default function Footer() {
  const reducedMotion = useReducedMotion();

  return (
    <footer id="end" className="min-h-svh overflow-hidden bg-coral px-5 pb-5 pt-[84px] text-text-warm sm:px-8 md:px-16">
      <div className="mx-auto flex min-h-[calc(100svh-109px)] w-full max-w-[1280px] flex-col justify-between gap-4">
        <div className="flex flex-col items-start gap-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-8">
          <motion.h2
            className="text-[clamp(36px,min(6.2vw,9vh),96px)] font-bold leading-[0.94] tracking-[-0.05em]"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            Ready when <span className="font-light">you are.</span>
          </motion.h2>

          <motion.div
            className="max-w-xs"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12 }}
          >
            <a
              href="/login"
              className="inline-flex items-center gap-3 rounded-md bg-warm px-[22px] py-[15px] text-[15px] font-semibold text-text-warm transition-transform hover:-translate-y-0.5 hover:bg-forest"
            >
              Start your workspace
              <ArrowUpRight className="h-[1.2em] w-[1.2em]" strokeWidth={1.8} />
            </a>
          </motion.div>
        </div>

        <motion.nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-text-warm/45 pt-3 text-[14px] text-coral-soft sm:flex sm:flex-wrap sm:gap-x-7 sm:text-[15px]"
          initial={reducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span className="col-span-2 sm:mr-auto">© 2026 Vynor</span>
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} href={link.href} className="transition-colors hover:text-text-warm">
              {link.label}
            </a>
          ))}
        </motion.nav>

        <motion.div
          aria-hidden="true"
          className="footer-wordmark select-none text-center font-bold leading-none tracking-[-0.07em] text-text-warm"
          initial={false}
          style={{ fontSize: "clamp(50px, 26vw, 480px)" }}
        >
          vynor
        </motion.div>
      </div>
    </footer>
  );
}
