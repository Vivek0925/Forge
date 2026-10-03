"use client";

import { useState } from "react";
import { CreateWorkspaceModal } from "@/components/workspace";
import { api } from "@/lib/api";
import type { Workspace } from "@/lib/workspace";
import { useActiveMeeting } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";

type User = {
  name?: string | null;
};

interface HeroProps {
  user?: User | null;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

export default function Hero({ user, onWorkspaceCreated }: HeroProps) {
  const [open, setOpen] = useState(false);

  const [meetingCode, setMeetingCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { openMeeting } = useActiveMeeting();

  async function handleJoinMeeting() {
    const input = meetingCode.trim();
    let code = input;

    try {
      const url = new URL(input);
      const pathParts = url.pathname.split("/").filter(Boolean);
      code = pathParts.at(-1) ?? input;
    } catch {
      // Treat non-URL input as a meeting code.
    }

    if (!code) {
      setJoinError("Enter a meeting code.");
      return;
    }

    try {
      setJoining(true);
      setJoinError("");

      const data = await api<{
        meetingId: string;
        workspaceSlug: string;
        meetingCode: string;
        hostId: string;
      }>("/meetings/join-code", {
        method: "POST",
        body: JSON.stringify({ meetingCode: code }),
      });

      openMeeting({
        meetingId: data.meetingId,
        slug: data.workspaceSlug,
        meetingCode: data.meetingCode,
        hostId: data.hostId,
        source: "quick-join",
      });
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Unable to join meeting.",
      );
    } finally {
      setJoining(false);
    }
  }

  async function handleQuickMeeting() {
    setJoinError("");

    try {
      setJoining(true);

      const data = await api<{
        meetingId: string;
        workspaceSlug: string;
        meetingCode: string;
        hostId: string;
      }>("/meetings/quick", { method: "POST" });

      openMeeting({
        meetingId: data.meetingId,
        slug: data.workspaceSlug,
        meetingCode: data.meetingCode,
        hostId: data.hostId,
        source: "quick-join",
      });
    } catch (error) {
      setJoinError(
        error instanceof Error
          ? error.message
          : "Unable to create quick meeting.",
      );
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center justify-center text-center">
      <h1 className="max-w-[800px] text-[38px] font-light leading-[1.1] tracking-[-0.03em] text-[#14141C] sm:text-[48px] md:text-[64px] lg:text-[72px]">
        Workspace, meetings, and collaboration in one place
      </h1>
      <p className="mx-auto mt-5 max-w-[580px] text-[15px] leading-[1.6] text-[#5B5D6E] sm:mt-6 sm:text-[18px]">
        Welcome{user?.name ? `, ${user.name}` : ""}. Create a workspace for your
        project, jump into a quick meeting, or join one using a code.
      </p>

      <div className="mt-8 flex w-full max-w-[600px] flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center">
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#86D9A8] bg-[#EAFBF1] px-6 py-3 text-[15px] font-medium text-[#065F46] transition-colors hover:bg-[#DFF7E8] sm:px-8 sm:text-[16px]"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create workspace
        </button>
        <button
          type="button"
          onClick={handleQuickMeeting}
          className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#DEDFE8] bg-transparent px-6 py-3 text-[15px] font-medium text-[#14141C] transition-colors hover:bg-[#FAFAF8] sm:px-8 sm:text-[16px]"
        >
          <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick meeting
        </button>
      </div>

      <div className="mt-6 w-full max-w-[500px] sm:mt-8">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={meetingCode}
            onChange={(event) => {
              setMeetingCode(event.target.value);
              setJoinError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleJoinMeeting();
              }
            }}
            placeholder="Enter a code or meeting link"
            className="min-w-0 flex-1 rounded-full border-2 border-[#DEDFE8] bg-white px-5 py-3 text-[14px] placeholder-[#5B5D6E] transition-all focus:border-[#059669] focus:outline-none sm:px-6"
          />
          <button
            type="button"
            onClick={() => void handleJoinMeeting()}
            disabled={joining}
            className="min-h-11 rounded-full bg-[#FAFAF8] px-6 py-3 text-[14px] font-medium text-[#5B5D6E] transition-all hover:bg-[#DEDFE8] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0"
          >
            {joining ? "Joining..." : "Join"}
          </button>
        </div>
      </div>

      {joinError && (
        <p className="mt-2 px-4 text-left text-sm text-red-500">{joinError}</p>
      )}

      <div className="mt-12 flex items-center justify-center sm:mt-16">
        <div className="relative h-[220px] w-[220px] rounded-full bg-gradient-to-br from-[#059669]/20 to-[#065F46]/10 p-7 sm:h-[280px] sm:w-[280px] sm:p-8">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full text-[#059669]/30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <circle cx="65" cy="80" r="18" />
            <circle cx="135" cy="80" r="18" />
            <path d="M 70 120 Q 100 140 130 120" strokeLinecap="round" />
            <circle cx="100" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
      </div>

      <CreateWorkspaceModal
        open={open}
        onOpenChange={setOpen}
        onCreated={onWorkspaceCreated}
      />
    </div>
  );
}
