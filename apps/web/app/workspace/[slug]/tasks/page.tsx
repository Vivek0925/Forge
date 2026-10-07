import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import TasksBoard from "./_components/TasksBoard";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <WorkspaceSectionPage
      eyebrow="Tasks"
      title="Tasks"
      description="Organize and track work across your workspace."
    >
      <TasksBoard workspaceSlug={slug} />
    </WorkspaceSectionPage>
  );
}