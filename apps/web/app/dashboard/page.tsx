"use client";
import { useAuth } from "@/app/context/AuthContext";
import Container from "@/components/ui/Container";
import { DashboardHeader, Hero, WorkspaceHistory } from "./components";
import type { WorkspaceCardData } from "./components/WorkspaceCard";
import Footer from "@/components/layout/Footer";

const recentWorkspaces: WorkspaceCardData[] = [];

// export const metadata = {
//   title: "Dashboard | Forge",
//   description:
//     "Manage workspaces, launch a quick meeting room, and review recent project activity.",
// };

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="relative min-h-screen bg-[#F8F8F6] text-[#14141C]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-[-8rem] top-0 h-[24rem] w-[24rem] rounded-full bg-[#059669]/10 blur-[90px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[10rem] h-[18rem] w-[18rem] rounded-full bg-[#065F46]/10 blur-[90px]" />

      <Container>
        <DashboardHeader />
      </Container>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden py-20">
        <Container>
          <Hero user={user} />
        </Container>
      </section>

      <section className="border-t border-[#DEDFE8]/40 bg-[#FAFAF8]/40 py-20">
        <Container>
          <WorkspaceHistory user={user} workspaces={recentWorkspaces} />
        </Container>
      </section>
        <Footer />
    </main>
  );
}
