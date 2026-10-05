"use client";

import { LockKeyhole, Map, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ROLES = ["Owner", "Admin", "Member", "Guest"];

const POINTS = [
  {
    icon: Users,
    title: "Roles that fit your team",
    description: "Decide who can manage, edit or just look.",
  },
  {
    icon: LockKeyhole,
    title: "Invite-only by default",
    description: "People join with an invitation, nobody wanders in.",
  },
  {
    icon: Map,
    title: "One place to look",
    description: "Projects, people and files stay together, never scattered.",
  },
];

export default function WhyForge() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="workspace" className="flex min-h-svh flex-col justify-center overflow-hidden bg-forest px-5 py-[100px] text-text-warm sm:px-8 md:px-16">
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-12 md:grid-cols-2 md:gap-[clamp(24px,5vw,72px)]">
        <div>
          <motion.h2
            className="text-[clamp(40px,5.4vw,80px)] font-bold leading-[0.94] tracking-[-0.05em]"
            initial={reducedMotion ? false : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            Your workspace.
            <br />
            <span className="font-light text-forest-light">Your rules.</span>
          </motion.h2>

          <motion.p
            className="my-6 mb-8 max-w-[30em] text-[clamp(16px,1.4vw,20px)] leading-[1.45] text-forest-muted"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.12 }}
          >
            Invite the right people, give them the right role and keep every project in the workspace it belongs to.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-2.5"
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.22 }}
          >
            {ROLES.map((role) => (
              <span key={role} className="rounded-full border border-text-warm/40 px-[18px] py-2 text-[15px]">
                {role}
              </span>
            ))}
          </motion.div>
        </div>

        <div>
          {POINTS.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              className={`grid grid-cols-[44px_1fr] gap-x-3.5 gap-y-1 border-t border-text-warm/25 py-[26px] ${index === POINTS.length - 1 ? "border-b" : ""}`}
              initial={reducedMotion ? false : { opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <Icon className="row-span-2 h-6 w-6 text-butter" strokeWidth={1.8} />
              <b className="text-[22px] tracking-[-0.03em]">{title}</b>
              <p className="m-0 text-forest-muted">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
