import MeetingRoom from "../components/MeetingRoom";

interface MeetingRoomPageProps {
  params: Promise<{
    slug: string;
    meetingId: string;
  }>;
}

export default async function MeetingRoomPage({
  params,
}: MeetingRoomPageProps) {
  const { slug, meetingId } = await params;

  return (
    <MeetingRoom
      slug={slug}
      meetingId={meetingId}
    />
  );
}