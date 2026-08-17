import Meetings from "./components/Meetings";

interface MeetingsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MeetingsPage({
  params,
}: MeetingsPageProps) {
  const { slug } = await params;

  return <Meetings slug={slug} />;
}