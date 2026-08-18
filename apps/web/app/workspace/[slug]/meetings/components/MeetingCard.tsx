"use client";

import { CalendarDays, Clock, Users, Video } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  scheduledAt?: string | null;
  createdAt: string;

  createdBy: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  participants: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string | null;
    };
  }[];
}

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meetingId: string) => void;
}

export default function MeetingCard({ meeting, onJoin }: MeetingCardProps) {
  const isActive = meeting.status === "ACTIVE";
  const isEnded = meeting.status === "ENDED";

  const scheduledDate = meeting.scheduledAt
    ? new Date(meeting.scheduledAt)
    : null;

  return (
    <div className="rounded-3xl border border-[#E7E9EF] bg-green-50 p-6 shadow-[0_10px_35px_rgba(20,20,28,0.04)] transition hover:shadow-[0_16px_40px_rgba(20,20,28,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAFBF1]">
            <Video size={21} className="text-[#1E8E5A]" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#20232D]">
              {meeting.title}
            </h3>

            {meeting.description && (
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#707487]">
                {meeting.description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#85899A]">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {meeting.participants.length}{" "}
                {meeting.participants.length === 1
                  ? "participant"
                  : "participants"}
              </span>

              {scheduledDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />

                  {scheduledDate.toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}

              {scheduledDate && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />

                  {scheduledDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-[#E7F8EF] text-[#1E8E5A]"
              : isEnded
                ? "bg-zinc-100 text-zinc-500"
                : "bg-[#F3F4F7] text-[#656979]"
          }`}
        >
          {meeting.status}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F0F1F4] pt-2">
        <p className="text-xs text-[#85899A]">
          Created by{" "}
          <span className="font-medium text-[#555968]">
            {meeting.createdBy.name}
          </span>
        </p>

        {!isEnded && (
          <button
            type="button"
            onClick={() => onJoin(meeting.id)}
            className="flex items-center gap-2 background-none rounded-xl  px-3 py-1.5 border border-[#ECEEF3]  text-sm font-medium text-black transition hover:bg-paper-700"
          >
            <Video size={16} />

            {isActive ? "Join Meeting" : "View Meeting"}
          </button>
        )}
      </div>
    </div>
  );
}
