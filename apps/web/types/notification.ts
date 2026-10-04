export interface MeetingNotification {
  id: string;
  type: "MEETING_SCHEDULED";
  title: string;
  message: string;
  meetingId: string | null;
  readAt: string | null;
  createdAt: string;
}
