import WorkspaceShell from "./_components/WorkspaceShell";
import WorkspaceSocket from "./_components/WorkspaceSocket";
import {
  ActiveMeetingProvider,
} from "./_components/ActiveMeetingProvider";
import ActiveMeeting from "./_components/ActiveMeeting";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <ActiveMeetingProvider>
      <WorkspaceSocket workspaceSlug={slug} />

      <WorkspaceShell>
        {children}
      </WorkspaceShell>

      <ActiveMeeting />
    </ActiveMeetingProvider>
  );
}