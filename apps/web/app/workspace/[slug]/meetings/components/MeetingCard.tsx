"use client";

import { CalendarDays, Clock, Users, Video,MoreVertical, } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";  

interface Meeting {
  id: string;
  title: string;
  meetingCode: string;
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
  onEdit: (meeting: Meeting) => void;
}

export default function MeetingCard({ meeting, onJoin, onEdit }: MeetingCardProps) {
  const isActive = meeting.status === "ACTIVE";
  const isEnded = meeting.status === "ENDED";

  const [showMenu, setShowMenu] = useState(false);

  const { user } = useAuth();
  const isCreator = user?.id === meeting.createdBy.id;

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
            className="flex hover:bg-green-300/60 items-center gap-2 bg-white/40 rounded-xl  px-3 py-1.5 border border-[#ECEEF3]  text-sm font-medium text-black transition hover:bg-paper-700"
          >
            <Video size={16} />

            {isActive ? "Join Meeting" : "View Meeting"}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/meet/${meeting.meetingCode}`,
            );
          }}
          className="hover:bg-green-300/60 flex items-center gap-2 rounded-xl border border-[#ECEEF3] bg-white/40 px-3 py-1.5 text-sm font-medium text-black transition"
        >
          Copy Link
        </button>

        {meeting.status === "SCHEDULED" && isCreator && (
  <div className="relative">
    <button
      type="button"
      onClick={() => setShowMenu((prev) => !prev)}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#707487] transition hover:bg-[#F3F4F7] hover:text-[#20232D]"
      aria-label="Meeting options"
    >
      <MoreVertical size={18} />
    </button>

    {showMenu && (
      <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-[#E7E9EF] bg-white p-1.5 shadow-lg">
        <button
          type="button"
          onClick={() => {
            setShowMenu(false);
            onEdit(meeting);
          }}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#20232D] transition hover:bg-[#F5F6F8]"
        >
          Edit meeting
        </button>

        <button
          type="button"
          onClick={() => {
            setShowMenu(false);
            // Cancel will be wired next.
          }}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
        >
          Cancel meeting
        </button>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
}
