"use client";

import Link from "next/link";

const links = [
  { label: "Platform", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center gap-8 px-5 py-4 text-text-warm sm:px-8 md:px-16">
      <Link href="#top" className="flex items-center gap-2 text-2xl font-bold tracking-[-0.04em]">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-current">
          <span className="text-[15px] text-coral">V</span>
        </span>
        vynor
      </Link>

      <nav className="mx-auto hidden items-center gap-7 text-[15px] font-medium md:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-opacity hover:opacity-75"
            >
              {link.label}
            </a>
          ))}
      </nav>

      <Link href="/login" className="flex items-center gap-2 rounded-md bg-text-warm px-[18px] py-2.5 text-sm font-semibold text-ink transition-opacity hover:opacity-85">
        Meet your workspace
        <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}
