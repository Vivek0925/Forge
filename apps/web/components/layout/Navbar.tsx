"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "../ui/Container";
import Button from "../ui/Button";

const links = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Forge", href: "#why-forge" },
  { label: "Developers", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#DEDFE8] bg-[#FAFAF8]/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-[68px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
            <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
          </span>
          <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
            Forge
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] text-[#5B5D6E] transition-colors hover:text-[#14141C]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden text-[13px] text-[#5B5D6E] transition-colors hover:text-[#14141C] md:block"
          >
            Log in
          </a>
          {/* `size` isn't defined on ButtonProps in this codebase; cast to any to pass through for now */}
          <Button {...({ size: "sm" } as any)}>Join beta</Button>
        </div>
      </Container>
    </header>
  );
}
