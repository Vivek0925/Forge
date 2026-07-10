type WorkspaceSectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function WorkspaceSectionPage({
  eyebrow,
  title,
  description,
  children,
}: WorkspaceSectionPageProps) {
  return (
    <section className="space-y-6 rounded-[32px] border border-[#DEDFE8] bg-white p-6 shadow-[0_18px_50px_rgba(20,20,28,0.06)] md:p-8">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#059669]">
          {eyebrow}
        </div>
        <h1 className="mt-2 text-[32px] font-light tracking-[-0.03em] text-[#14141C] md:text-[38px]">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[#5B5D6E] md:text-[15px]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}
