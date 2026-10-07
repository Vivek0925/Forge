import TasksBoard from "./_components/TasksBoard";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <TasksBoard workspaceSlug={slug} />;
}