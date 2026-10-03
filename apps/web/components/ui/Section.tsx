import { ReactNode } from "react";
import Container from "./Container";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export default function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  align = "left",
}: SectionProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section id={id} className={`relative py-16 sm:py-20 md:py-32 ${className}`}>
      <Container>
        {(eyebrow || title || description) && (
          <div className={`mb-10 flex max-w-[640px] flex-col gap-3 sm:mb-14 sm:gap-4 ${alignment} ${align === "center" ? "mx-auto" : ""}`}>
            {eyebrow && (
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-[28px] font-light leading-[1.15] tracking-[-0.01em] text-[#14141C] sm:text-[32px] md:text-[42px]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[15px] leading-relaxed text-[#5B5D6E]">{description}</p>
            )}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
