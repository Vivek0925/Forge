import WorkspaceShell from "./_components/WorkspaceShell";
import WorkspaceSocket from "./_components/WorkspaceSocket";
import { getWorkspaceBySlug } from "@/lib/workspace";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const workspace = await getWorkspaceBySlug(slug);

  return (
    <>
      <WorkspaceSocket workspaceId={workspace.id} />

      <WorkspaceShell>
        {children}
      </WorkspaceShell>
    </>
  );
}