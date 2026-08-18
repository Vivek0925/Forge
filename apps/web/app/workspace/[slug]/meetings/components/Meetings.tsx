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

type MeetingMode = "now" | "scheduled";

export default function Meetings({
  slug,
}: MeetingsProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(
    [],
  );

  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] =
    useState(false);

  const [mode, setMode] =
    useState<MeetingMode>("now");

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

      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (slug) {
      loadMeetings();
    }
  }, [slug]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setMode("now");
    setError("");
  }

  function closeModal() {
    if (creating) return;

    setShowCreate(false);
    resetForm();
  }

  async function createMeeting() {
    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (mode === "scheduled" && !scheduledAt) {
      setError(
        "Please select a date and time.",
      );
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

            ...(mode === "scheduled"
              ? {
                  scheduledAt: new Date(
                    scheduledAt,
                  ).toISOString(),
                }
              : {}),
          }),
        },
      );

      setMeetings((prev) => [
        meeting,
        ...prev,
      ]);

      setShowCreate(false);
      resetForm();
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
  window.location.href =
    `/workspace/${slug}/meetings/${meetingId}`;
}

  const activeMeetings = meetings.filter(
    (meeting) =>
      meeting.status === "ACTIVE",
  );

  const scheduledMeetings = meetings.filter(
    (meeting) =>
      meeting.status === "SCHEDULED",
  );

  return (
    <div className="flex h-full flex-col background-none rounded-xl bg-white  ">
      {/* Header */}

      <div className="border-b border-[#ECEEF3] bg-white rounded-xl px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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

          <button
            type="button"
            onClick={() =>
              setShowCreate(true)
            }
            className="flex items-center gap-2 bg-none rounded-xl px-4 py-2.5 text-sm font-medium text-black transition hover:bg-green-50"
          >
            <Plus size={17} />
            New Meeting
          </button>
        </div>
      </div>

      {/* Content */}

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {error && !showCreate && (
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
                No active or upcoming meetings
              </h2>

              <p className="mt-2 max-w-md text-center text-sm leading-6 text-[#707487]">
                Start an instant meeting or
                schedule one for later.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(true)
                }
                className="mt-6 flex items-center gap-2 rounded-xl  px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#30333E]"
              >
                <Plus size={17} />
                New Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Live */}

              {activeMeetings.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1E8E5A]" />

                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#85899A]">
                      Live now
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeMeetings.map(
                      (meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onJoin={handleJoin}
                        />
                      ),
                    )}
                  </div>
                </section>
              )}

              {/* Upcoming */}

              {scheduledMeetings.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-3">
                    <CalendarDays
                      size={16}
                      className="text-[#85899A]"
                    />

                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#85899A]">
                      Upcoming
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {scheduledMeetings.map(
                      (meeting) => (
                        <MeetingCard
                          key={meeting.id}
                          meeting={meeting}
                          onJoin={handleJoin}
                        />
                      ),
                    )}
                  </div>
                </section>
              )}
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
                  New Meeting
                </h2>

                <p className="mt-1 text-sm text-[#707487]">
                  Start now or schedule it for
                  later.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl p-2 text-[#85899A] transition hover:bg-zinc-100 hover:text-[#20232D] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Title */}

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

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[#20232D]">
                  Description
                  <span className="ml-1 font-normal text-[#A1A5B3]">
                    (optional)
                  </span>
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

              {/* Meeting mode */}

              <div>
                <label className="mb-3 block text-sm font-medium text-[#20232D]">
                  When?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setMode("now")
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      mode === "now"
                        ? "border-[#9ADDBB] bg-[#F0FBF5]"
                        : "border-[#E1E3EA] bg-white hover:bg-[#FAFAFB]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          mode === "now"
                            ? "bg-[#1E8E5A]"
                            : "border border-[#B7BAC5]"
                        }`}
                      />

                      <span className="text-sm font-semibold text-[#20232D]">
                        Start now
                      </span>
                    </div>

                    <p className="mt-2 pl-4 text-xs leading-5 text-[#707487]">
                      Start the meeting
                      immediately.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setMode("scheduled")
                    }
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      mode === "scheduled"
                        ? "border-[#9ADDBB] "
                        : "border-[#E1E3EA] bg-white hover:bg-[#FAFAFB]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className={
                          mode ===
                          "scheduled"
                            ? "text-[#1E8E5A]"
                            : "text-[#85899A]"
                        }
                      />

                      <span className="text-sm font-semibold text-[#20232D]">
                        Schedule
                      </span>
                    </div>

                    <p className="mt-2 pl-6 text-xs leading-5 text-[#707487]">
                      Pick a date and time.
                    </p>
                  </button>
                </div>
              </div>

              {/* Schedule date */}

              {mode === "scheduled" && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#20232D]">
                    <CalendarDays size={15} />
                    Date and time
                  </label>

                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={new Date()
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) =>
                      setScheduledAt(
                        e.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-[#DEDFE8] px-4 py-3 text-sm text-[#20232D] outline-none transition focus:border-[#BEEAD7] focus:ring-2 focus:ring-[#E7F8EF]"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}

            <div className="mt-7 bg-none flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#707487] transition hover:bg-zinc-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createMeeting}
                disabled={
                  creating ||
                  !title.trim() ||
                  (mode === "scheduled" &&
                    !scheduledAt)
                }
                className="flex items-center gap-2 rounded-xl  px-5 py-2.5 text-sm font-medium text-black transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Video size={16} />

                {creating
                  ? "Creating..."
                  : mode === "now"
                    ? "Start Meeting"
                    : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}