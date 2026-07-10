import Link from "next/link";

export default function WorkspaceNotFound() {
  return (
    <div className="rounded-[32px] border border-[#DEDFE8] bg-white p-8 shadow-[0_18px_50px_rgba(20,20,28,0.06)]">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#B91C1C]">
        Workspace not found
      </div>
      <h1 className="mt-2 text-[30px] font-light tracking-[-0.03em] text-[#14141C]">
        We could not open this workspace.
      </h1>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#5B5D6E]">
        The workspace may have been deleted, renamed, or you may not have
        access.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex rounded-full border border-[#DEDFE8] px-5 py-2.5 text-[14px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
