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
    <section id={id} className={`relative py-24 md:py-32 ${className}`}>
      <Container>
        {(eyebrow || title || description) && (
          <div className={`mb-14 flex max-w-[640px] flex-col gap-4 ${alignment} ${align === "center" ? "mx-auto" : ""}`}>
            {eyebrow && (
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-[32px] font-light leading-[1.15] tracking-[-0.01em] text-[#14141C] md:text-[42px]">
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
