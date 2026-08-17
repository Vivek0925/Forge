"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus,
  Video,
  X,
} from "lucide-react";

import MeetingCard from "../components/MeetingCard";
import { api } from "@/lib/api";

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  status:
    | "SCHEDULED"
    | "ACTIVE"
    | "ENDED"
    | "CANCELLED";
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

interface MeetingsProps {
  slug: string;
}

export default function Meetings({
  slug,
}: MeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [scheduledAt, setScheduledAt] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const [error, setError] = useState("");

  async function loadMeetings() {
    try {
      setLoading(true);
      setError("");

      const data = await api<Meeting[]>(
        `/meetings/workspace/${slug}`,
      );

      setMeetings(data);
    } catch (error) {
      console.error(
        "Failed to load meetings",
        error,
      );

      setError(
        "Failed to load meetings.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) {
      loadMeetings();
    }
  }, [slug]);

  async function createMeeting() {
    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const meeting = await api<Meeting>(
        `/meetings/workspaces/${slug}`,
        {
          method: "POST",

          body: JSON.stringify({
            title: title.trim(),
            description:
              description.trim() || undefined,
            scheduledAt:
              scheduledAt || undefined,
          }),
        },
      );

      setMeetings((prev) => [
        meeting,
        ...prev,
      ]);

      setTitle("");
      setDescription("");
      setScheduledAt("");

      setShowCreate(false);
    } catch (error) {
      console.error(
        "Failed to create meeting",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create meeting.",
      );
    } finally {
      setCreating(false);
    }
  }

  function handleJoin(meetingId: string) {
    console.log(
      "Join meeting:",
      meetingId,
    );

    // We'll navigate to the meeting
    // lobby here next.
  }

  return (
    <div className="flex h-full flex-col bg-[#FAFAFB]">
      {/* Header */}

      <div className="border-b border-[#ECEEF3] bg-white px-8 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAFBF1]">
                <Video
                  size={21}
                  className="text-[#1E8E5A]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[#20232D]">
                  Meetings
                </h1>

                <p className="mt-1 text-sm text-[#707487]">
                  Meet, collaborate, and stay
                  connected with your workspace.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowCreate(true)
            }
            className="flex items-center gap-2 rounded-xl bg-[#20232D] px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#30333E]"
          >
            <Plus size={17} />
            New Meeting
          </button>
        </div>
      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-[#707487]">
              Loading meetings...
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#DCDFE7] bg-white">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F7F5]">
                <Video
                  size={30}
                  className="text-[#1E8E5A]"
                />
              </div>

              <h2 className="text-xl font-semibold text-[#20232D]">
                No meetings yet
              </h2>

              <p className="mt-2 max-w-md text-center text-sm leading-6 text-[#707487]">
                Create your first meeting and
                start collaborating with your
                workspace.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(true)
                }
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#20232D] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#30333E]"
              >
                <Plus size={17} />
                Create Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#85899A]">
                  Your Meetings
                </h2>
              </div>

              {meetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoin={handleJoin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#20232D]">
                  Create Meeting
                </h2>

                <p className="mt-1 text-sm text-[#707487]">
                  Set up a new workspace meeting.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-xl p-2 text-[#85899A] transition hover:bg-zinc-100 hover:text-[#20232D]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#20232D]">
                  Meeting title
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Weekly Engineering Sync"
                  className="w-full rounded-xl border border-[#DEDFE8] px-4 py-3 text-sm text-[#20232D] outline-none transition placeholder:text-[#A1A5B3] focus:border-[#BEEAD7] focus:ring-2 focus:ring-[#E7F8EF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#20232D]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value,
                    )
                  }
                  rows={3}
                  placeholder="What is this meeting about?"
                  className="w-full resize-none rounded-xl border border-[#DEDFE8] px-4 py-3 text-sm text-[#20232D] outline-none transition placeholder:text-[#A1A5B3] focus:border-[#BEEAD7] focus:ring-2 focus:ring-[#E7F8EF]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#20232D]">
                  <CalendarDays size={15} />
                  Schedule
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) =>
                    setScheduledAt(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-[#DEDFE8] px-4 py-3 text-sm text-[#20232D] outline-none transition focus:border-[#BEEAD7] focus:ring-2 focus:ring-[#E7F8EF]"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#707487] transition hover:bg-zinc-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createMeeting}
                disabled={
                  creating ||
                  !title.trim()
                }
                className="rounded-xl bg-[#20232D] px-5 py-2.5 text-sm font-medium text-black border  transition hover:bg-[#30333E] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}