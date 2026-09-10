import MeetingRoomLauncher from "../../_components/MeetingRoomLauncher";

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
    <MeetingRoomLauncher
      slug={slug}
      meetingId={meetingId}
    />
  );
}