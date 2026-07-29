import WorkspaceChat from "./_components/WorkspaceChat";

interface ChatPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ChatPage({
  params,
}: ChatPageProps) {
  const { slug } = await params;

  return <WorkspaceChat slug={slug} />;
}