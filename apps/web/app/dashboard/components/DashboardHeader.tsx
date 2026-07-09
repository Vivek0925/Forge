import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#DEDFE8]/40 py-4">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
          <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
        </span>
        <span className="text-[15px] font-medium tracking-[-0.01em] text-[#14141C]">
          Forge
        </span>
      </Link>
    </header>
  );
}
