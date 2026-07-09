type User = {
  name?: string | null;
};

interface HeroProps {
  user?: User | null;
}

export default function Hero({ user }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <h1 className="max-w-[800px] text-[48px] font-light leading-[1.15] tracking-[-0.03em] text-[#14141C] md:text-[64px] lg:text-[72px]">
        Workspace, meetings, and collaboration in one place
      </h1>
      <p className="mx-auto mt-6 max-w-[580px] text-[16px] leading-[1.6] text-[#5B5D6E] md:text-[18px]">
        Welcome{user?.name ? `, ${user.name}` : ""}. Create a workspace for your
        project, jump into a quick meeting, or join one using a code.
      </p>

      <div className="mt-12 flex w-full max-w-[600px] flex-col items-center gap-4 sm:flex-row sm:gap-3">
        <button className="flex flex-1 items-center justify-center rounded-full bg-[#14141C] px-8 py-3 text-[16px] font-medium text-white transition-colors hover:bg-[#1F1F29]">
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create workspace
        </button>
        <button className="flex flex-1 items-center justify-center rounded-full border-2 border-[#DEDFE8] bg-transparent px-8 py-3 text-[16px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8]">
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick meeting
        </button>
      </div>

      <div className="mt-8 w-full max-w-[500px]">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter a code or meeting link"
            className="flex-1 rounded-full border-2 border-[#DEDFE8] bg-white px-6 py-3 text-[14px] placeholder-[#5B5D6E] transition-all focus:border-[#059669] focus:outline-none"
          />
          <button className="rounded-full bg-[#FAFAF8] px-6 py-3 text-[14px] font-medium text-[#5B5D6E] transition-all hover:bg-[#DEDFE8]">
            Join
          </button>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-center">
        <div className="relative h-[280px] w-[280px] rounded-full bg-gradient-to-br from-[#059669]/20 to-[#065F46]/10 p-8">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full text-[#059669]/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <circle cx="65" cy="80" r="18" />
            <circle cx="135" cy="80" r="18" />
            <path d="M 70 120 Q 100 140 130 120" strokeLinecap="round" />
            <circle cx="100" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
