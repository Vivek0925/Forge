"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const PLANS = [
  {
    name: "Starter",
    description: "For one person trying Vynor.",
    amount: "$0",
    cadence: "forever",
    action: "Start for free",
    features: ["One workspace", "Three projects", "Chat, tasks and docs"],
    highlighted: false,
  },
  {
    name: "Team",
    description: "For small teams that ship together.",
    amount: "$12",
    cadence: "per member, monthly",
    action: "Start your team",
    features: [
      "Everything in Starter",
      "Unlimited projects",
      "Meetings and whiteboards",
      "Roles and invitations",
    ],
    highlighted: true,
  },
  {
    name: "Company",
    description: "For organizations with many teams.",
    amount: "$29",
    cadence: "per member, monthly",
    action: "Talk to us",
    features: ["Everything in Team", "Multiple workspaces", "Priority support"],
    highlighted: false,
  },
];

export default function Pricing() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="price" className="flex min-h-svh flex-col justify-center overflow-hidden bg-cream px-5 py-[100px] sm:px-8 md:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        <motion.div
          className="mb-7 flex flex-wrap items-end justify-between gap-8"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="text-[clamp(40px,5.4vw,80px)] font-bold leading-[0.94] tracking-[-0.05em] text-ink">
            Start free.
            <br />
            <span className="font-light">Grow together.</span>
          </h2>
          <p className="mb-1 max-w-[26em] text-[17px] text-muted">
            Pick the plan that fits your team today and change it whenever you need.
          </p>
        </motion.div>

        <div className="grid overflow-hidden rounded-[28px] border border-ink/15 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.article
              key={plan.name}
              className={`flex flex-col gap-4 p-6 sm:p-8 md:p-10 ${plan.highlighted ? "bg-sage" : "bg-transparent"} ${index > 0 ? "border-t border-ink/15 md:border-l md:border-t-0" : ""}`}
              initial={reducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <h3 className="text-[28px] font-bold leading-none tracking-[-0.04em] text-ink">{plan.name}</h3>
              <p className="m-0 text-muted">{plan.description}</p>

              <div className="mt-2 flex items-baseline gap-1.5">
                <strong className="text-[64px] font-bold leading-none tracking-[-0.05em] text-ink">{plan.amount}</strong>
                <small className="text-[15px] text-muted">{plan.cadence}</small>
              </div>

              <a
                href="/login"
                className={`mt-1 flex items-center justify-between rounded-md border px-[22px] py-[15px] text-[15px] font-semibold transition-transform hover:-translate-y-0.5 ${
                  plan.highlighted
                    ? "border-ink bg-ink text-text-warm"
                    : "border-ink bg-ink text-text-warm hover:bg-forest"
                }`}
              >
                {plan.action}
                <ArrowUpRight className="h-[1.2em] w-[1.2em]" strokeWidth={1.8} />
              </a>

              <ul className="mt-2 grid list-none gap-2.5 p-0">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-ink">
                    <Check className="h-[1.2em] w-[1.2em] shrink-0 text-coral" strokeWidth={1.8} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
