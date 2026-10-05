"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { label: "Platform", href: "#show" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#price" },
];

const LIGHT_SECTIONS = new Set(["show", "price", "faq"]);

export default function Navbar() {
  const [isLightSection, setIsLightSection] = useState(false);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[id], footer[id]"),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setIsLightSection(LIGHT_SECTIONS.has(visible.target.id));
        }
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex items-center gap-8 px-5 py-4 transition-colors duration-300 sm:px-8 md:px-16 ${
        isLightSection ? "navbar-ink" : "navbar-warm"
      }`}
    >
      <Link href="#top" className="flex shrink-0 items-center gap-2 text-2xl font-bold tracking-[-0.04em]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-current">
          <span className={`text-[15px] ${isLightSection ? "text-cream" : "text-coral"}`}>V</span>
        </span>
        vynor
      </Link>

      <nav className="mx-auto hidden items-center gap-7 text-[15px] font-medium md:flex" aria-label="Main">
        {links.map((link) => (
          <a key={link.label} href={link.href} className="transition-opacity hover:opacity-65">
            {link.label}
          </a>
        ))}
      </nav>

      <Link
        href="/login"
        className={`flex shrink-0 items-center gap-2 rounded-md px-[22px] py-3 text-[15px] font-semibold shadow-md transition-[transform,background-color,color] hover:-translate-y-0.5 ${
          isLightSection ? "navbar-cta-light" : "navbar-cta-dark"
        }`}
      >
        Meet your workspace
        <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
