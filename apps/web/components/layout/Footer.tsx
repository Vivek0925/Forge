import Container from "../ui/Container";

const columns = [
  {
    title: "Product",
    links: ["Chat", "Meetings", "Docs", "Whiteboard", "Tasks", "Files"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Security"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Changelog", "API", "Status"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t text-white bg-black border-[#DEDFE8] bg-[#FAFAF8] py-16">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#14141C]">
                <span className="h-[9px] w-[9px] rounded-[2px] bg-[#059669]" />
              </span>
              <span className="text-[15px] text-white font-medium text-[#14141C]">Forge</span>
            </div>
            <p className="mt-4 text-white max-w-[260px] text-[13px] leading-relaxed text-[#8A8CA0]">
              The digital engineering workspace. One project, everything connected.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-white text-[11px] uppercase tracking-[0.18em] text-[#8A8CA0]">
                {col.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-white transition-colors hover:text-[#14141C]"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-white   flex flex-col items-start justify-between gap-4 border-t border-[#DEDFE8] pt-8 text-[12px] text-[#8A8CA0] md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Forge. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#14141C]">Privacy</a>
            <a href="#" className="hover:text-[#14141C]">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
