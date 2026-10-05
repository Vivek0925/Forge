"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

const QUESTIONS = [
  {
    question: "What does Vynor replace?",
    answer:
      "The chat, docs, tasks and whiteboards you usually spread across separate apps now live together in one project.",
  },
  {
    question: "Who is it built for?",
    answer:
      "Software teams, designers and students who build things together and want everything in one place.",
  },
  {
    question: "How do I invite my team?",
    answer:
      "Create a workspace, then send invitations from the top bar. People join from a link and land in the project.",
  },
  {
    question: "Do I have to move everything at once?",
    answer: "No. Start with one project and bring the rest over when you are ready.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  function toggle(index: number) {
    setOpenIndex((current) => (current === index ? -1 : index));
  }

  return (
    <section id="faq" className="bg-cream px-5 pb-6 pt-6 sm:px-8 md:px-16">
      <div className="mx-auto grid w-full max-w-[1280px] items-start gap-10 md:grid-cols-2 md:gap-[clamp(24px,5vw,72px)]">
        <motion.h2
          className="text-[clamp(40px,5.4vw,80px)] font-bold leading-[0.94] tracking-[-0.05em] text-ink"
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          Questions,
          <br />
          <span className="font-light">answered.</span>
        </motion.h2>

        <div>
          {QUESTIONS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={item.question}
                className={`border-t border-ink/25 ${index === QUESTIONS.length - 1 ? "border-b" : ""}`}
                initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 py-[22px] text-left text-xl font-semibold tracking-[-0.03em] text-ink"
                >
                  {item.question}
                  <Plus
                    className={`h-7 w-7 shrink-0 font-light transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                    strokeWidth={1.4}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <p className="m-0 pb-[22px] text-muted">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
