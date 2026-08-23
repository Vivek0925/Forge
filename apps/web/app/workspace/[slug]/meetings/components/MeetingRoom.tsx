"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  MessageCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Settings,
  Users,
} from "lucide-react";

import { useMeeting } from "@/hooks/useMeeting";
import { socket } from "@/lib/socket";

interface MeetingRoomProps {
  slug: string;
  meetingId: string;
}

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

interface RemoteVideoProps {
  stream: MediaStream | undefined;
  participant: Participant;
}

interface MeetingChatMessage {
  id: string;
  meetingId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export default function MeetingRoom({ slug, meetingId }: MeetingRoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const streamRef = useRef<MediaStream | null>(null);

  /*
   * =========================================================
   * MEDIA SETTINGS
   * =========================================================
   *
   * Read saved settings synchronously.
   *
   * This fixes the race where getUserMedia()
   * could start before the restore useEffect.
   */

  const [cameraEnabled, setCameraEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    try {
      const saved = localStorage.getItem(`meeting-settings-${meetingId}`);

      if (!saved) {
        return true;
      }

      const settings = JSON.parse(saved);

      return typeof settings.cameraEnabled === "boolean"
        ? settings.cameraEnabled
        : true;
    } catch {
      return true;
    }
  });

  const [micEnabled, setMicEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return true;
    }

    try {
      const saved = localStorage.getItem(`meeting-settings-${meetingId}`);

      if (!saved) {
        return true;
      }

      const settings = JSON.parse(saved);

      return typeof settings.micEnabled === "boolean"
        ? settings.micEnabled
        : true;
    } catch {
      return true;
    }
  });

  const [stream, setStream] = useState<MediaStream | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [participantsOpen, setParticipantsOpen] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);

  const [chatInput, setChatInput] = useState("");

  const [chatLoading, setChatLoading] = useState(false);

  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);

  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  /*
   * =========================================================
   * SAVE SETTINGS
   * =========================================================
   */

  useEffect(() => {
    localStorage.setItem(
      `meeting-settings-${meetingId}`,
      JSON.stringify({
        cameraEnabled,
        micEnabled,
      }),
    );
  }, [meetingId, cameraEnabled, micEnabled]);

  /*
   * =========================================================
   * MEETING HOOK
   * =========================================================
   */

  const {
    participants,
    remoteStreams,
    localSocketId,
    replaceVideoTrack,
    leaveMeeting: leaveSocketMeeting,
  } = useMeeting({
    meetingId,
    stream,
    micEnabled,
    cameraEnabled,
  });

  /*
   * =========================================================
   * MEETING CHAT
   * =========================================================
   */

  useEffect(() => {
    function handleChatMessage(message: MeetingChatMessage) {
      if (message.meetingId !== meetingId) {
        return;
      }

      setChatMessages((previous) => {
        /*
         * Prevent duplicate messages.
         */
        if (previous.some((item) => item.id === message.id)) {
          return previous;
        }

        return [...previous, message];
      });
    }

    function handleChatHistory(data: { messages: MeetingChatMessage[] }) {
      setChatMessages(data.messages ?? []);

      setChatLoading(false);
    }

    function handleChatError(data: { message: string }) {
      console.error("[Meeting Chat]", data.message);

      setChatLoading(false);
    }

    socket.on("meeting:chat:message", handleChatMessage);

    socket.on("meeting:chat:history", handleChatHistory);

    socket.on("meeting:chat:error", handleChatError);

    /*
     * Ask backend for existing messages.
     */
    if (socket.connected) {
      setChatLoading(true);

      socket.emit("meeting:chat:history", {
        meetingId,
      });
    }

    return () => {
      socket.off("meeting:chat:message", handleChatMessage);

      socket.off("meeting:chat:history", handleChatHistory);

      socket.off("meeting:chat:error", handleChatError);
    };
  }, [meetingId]);

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    const container = chatMessagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [chatMessages, chatOpen]);

  /*
   * =========================================================
   * START CAMERA + MICROPHONE
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        setLoading(true);
        setError(null);

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1920,
            },
            height: {
              ideal: 1080,
            },
            facingMode: "user",
          },
          audio: true,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());

          return;
        }

        /*
         * Apply the saved/current state
         * immediately to the tracks.
         */

        mediaStream.getVideoTracks().forEach((track) => {
          track.enabled = cameraEnabled;
        });

        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = micEnabled;
        });

        streamRef.current = mediaStream;

        setStream(mediaStream);

        console.log("[Meeting] local media initialized", {
          cameraEnabled,
          micEnabled,
          tracks: mediaStream
            .getTracks()
            .map((track) => `${track.kind}:${track.enabled}`),
        });
      } catch (err) {
        console.error("[Meeting] media initialization failed:", err);

        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError(
            "Camera or microphone permission was denied. Please allow access to this site.",
          );
        } else if (
          err instanceof DOMException &&
          err.name === "NotFoundError"
        ) {
          setError("No camera or microphone was found.");
        } else if (
          err instanceof DOMException &&
          err.name === "NotReadableError"
        ) {
          setError(
            "Your camera or microphone may already be in use by another application.",
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to access camera and microphone.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    startMedia();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }
    };

    // Media should only initialize when entering
    // a meeting / changing meeting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  /*
   * =========================================================
   * KEEP LOCAL VIDEO ATTACHED
   * =========================================================
   */

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) {
      return;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("[Meeting] local video playback failed:", err);
      }
    };

    void playVideo();

    return () => {
      /*
       * DO NOT clear srcObject here.
       *
       * The stream itself is still valid.
       */
    };
  }, [stream]);

  function sendMeetingChatMessage() {
    const content = chatInput.trim();

    if (!content || !socket.connected) {
      return;
    }

    socket.emit("meeting:chat:send", {
      meetingId,
      content,
    });

    setChatInput("");
  }

  function handleChatKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMeetingChatMessage();
    }
  }

  /*
   * =========================================================
   * FULLSCREEN
   * =========================================================
   */

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }

  /*
   * =========================================================
   * CAMERA
   * =========================================================
   */

  function toggleCamera() {
    const tracks = streamRef.current?.getVideoTracks();

    if (!tracks?.length) {
      return;
    }

    const nextState = !cameraEnabled;

    tracks.forEach((track) => {
      track.enabled = nextState;
    });

    setCameraEnabled(nextState);
  }

  /*
   * =========================================================
   * SCREEN SHARING
   * =========================================================
   */

  async function startScreenSharing() {
    if (isScreenSharing || !streamRef.current) {
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) {
        return;
      }

      /*
       * Save the current camera track.
       */

      const cameraTrack = streamRef.current.getVideoTracks()[0];

      cameraTrackRef.current = cameraTrack ?? null;

      /*
       * Replace camera with screen
       * on every existing peer.
       */

      await replaceVideoTrack(screenTrack);

      /*
       * Show the screen locally.
       */

      screenStreamRef.current = screenStream;

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;

        videoRef.current.muted = true;

        try {
          await videoRef.current.play();
        } catch {
          // Browser may already be playing.
        }
      }

      setIsScreenSharing(true);

      /*
       * IMPORTANT:
       *
       * If the user clicks the browser's
       * "Stop sharing" button, this fires.
       */

      screenTrack.onended = () => {
        void stopScreenSharing();
      };
    } catch (error) {
      /*
       * User cancelling the browser picker
       * is normal, so don't show an error.
       */

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        return;
      }

      console.error("[ScreenShare] Failed to start:", error);
    }
  }

  async function stopScreenSharing() {
    if (!isScreenSharing) {
      return;
    }

    const cameraTrack = cameraTrackRef.current;

    /*
     * Stop screen capture.
     */

    screenStreamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });

    screenStreamRef.current = null;

    /*
     * Restore camera track.
     */

    if (cameraTrack) {
      await replaceVideoTrack(cameraTrack);

      /*
       * Put camera back into the local
       * preview stream.
       */

      if (streamRef.current) {
        const currentVideoTrack = streamRef.current.getVideoTracks()[0];

        if (currentVideoTrack && currentVideoTrack !== cameraTrack) {
          streamRef.current.removeTrack(currentVideoTrack);
        }

        const alreadyPresent = streamRef.current
          .getVideoTracks()
          .some((track) => track.id === cameraTrack.id);

        if (!alreadyPresent) {
          streamRef.current.addTrack(cameraTrack);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;

        try {
          await videoRef.current.play();
        } catch {
          // Ignore playback errors.
        }
      }
    }

    cameraTrackRef.current = null;

    setIsScreenSharing(false);
  }

  /*
   * =========================================================
   * MICROPHONE
   * =========================================================
   */

  function toggleMicrophone() {
    const tracks = streamRef.current?.getAudioTracks();

    if (!tracks?.length) {
      return;
    }

    const nextState = !micEnabled;

    tracks.forEach((track) => {
      track.enabled = nextState;
    });

    setMicEnabled(nextState);
  }

  /*
   * =========================================================
   * LEAVE
   * =========================================================
   */

  async function leaveMeeting() {
    if (isScreenSharing) {
      await stopScreenSharing();
    }
    /*
     * Tell the socket layer first.
     */
    leaveSocketMeeting();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore fullscreen cleanup.
      }
    }

    window.location.href = `/workspace/${slug}/meetings`;
  }

  /*
   * =========================================================
   * PARTICIPANT COUNT
   * =========================================================
   */

  /*
   * =========================================================
   * CLEAN PARTICIPANT LIST
   * =========================================================
   *
   * A user should only appear once.
   *
   * Socket IDs can change after reconnect.
   * Therefore deduplicate by userId.
   */

  const uniqueParticipants = Array.from(
    new Map(
      participants.map((participant) => [participant.userId, participant]),
    ).values(),
  );

  const localParticipant = uniqueParticipants.find(
    (participant) => participant.socketId === localSocketId,
  );

  /*
   * Never render our own socket as remote.
   */
  const remoteParticipants = uniqueParticipants.filter(
    (participant) => participant.socketId !== localSocketId,
  );

  /*
   * The participant count should represent
   * actual users in the meeting.
   */
  const participantCount = uniqueParticipants.length;

  const totalVideoTiles = 1 + remoteParticipants.length;

  const gridClass =
    totalVideoTiles === 1
      ? "grid-cols-1"
      : totalVideoTiles === 2
        ? "grid-cols-1 md:grid-cols-2"
        : totalVideoTiles <= 4
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0B0D11] text-white"
    >
      {/* ================================================= */}
      {/* TOP BAR */}
      {/* ================================================= */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111318]/95 px-4 backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() =>
              (window.location.href = `/workspace/${slug}/meetings`)
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            title="Back to meetings"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">Meeting</p>

            <p className="truncate text-xs text-white/35">{meetingId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setParticipantsOpen(true)}
            className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            title="View participants"
          >
            <Users size={16} />

            <span>
              {participantCount}{" "}
              {participantCount === 1 ? "participant" : "participants"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChatOpen((previous) => !previous)}
            title="Meeting chat"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
              chatOpen
                ? "bg-white/[0.12] text-white"
                : "text-white/50 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            <MessageCircle size={18} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.08] hover:text-white"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* ================================================= */}
      {/* VIDEO STAGE */}
      {/* ================================================= */}

      <main className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
        <div className={`grid h-full min-h-0 w-full ${gridClass} gap-3`}>
          {/* ============================================= */}
          {/* LOCAL VIDEO */}
          {/* ============================================= */}

          <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#171A20]">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />

                  <p className="text-sm text-white/50">Starting camera...</p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                    <CameraOff size={24} className="text-red-400" />
                  </div>

                  <h2 className="text-lg font-semibold">Camera unavailable</h2>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#20232D] transition hover:bg-white/90"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {!error && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${
                    cameraEnabled ? "block" : "hidden"
                  }`}
                />

                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#171A20]">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
                      V
                    </div>
                  </div>
                )}

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-black/45 px-3 py-2 text-xs text-white backdrop-blur-md">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      cameraEnabled ? "bg-[#52D88B]" : "bg-red-400"
                    }`}
                  />

                  {cameraEnabled ? "Camera on" : "Camera off"}
                </div>

                {!micEnabled && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-red-500/80 px-3 py-2 text-xs text-white backdrop-blur-md">
                    <MicOff size={13} />
                    Muted
                  </div>
                )}

                <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
                  You
                </div>
              </>
            )}
          </div>

          {/* ============================================= */}
          {/* REMOTE PARTICIPANTS */}
          {/* ============================================= */}

          {remoteParticipants.map((participant) => {
            const remoteStream = remoteStreams[participant.socketId];

            if (!remoteStream) {
              return (
                <RemoteWaitingTile
                  key={participant.userId}
                  participant={participant}
                />
              );
            }

            return (
              <RemoteVideo
                key={participant.userId}
                stream={remoteStream}
                participant={participant}
              />
            );
          })}
        </div>
      </main>

      {/* ================================================= */}
      {/* MEETING CHAT */}
      {/* ================================================= */}

      {chatOpen && (
        <aside className="absolute inset-y-16 right-0 z-40 flex w-full max-w-[380px] flex-col border-l border-white/[0.08] bg-[#111318]/[0.98] shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
            <div>
              <h2 className="text-sm font-semibold text-white">Meeting chat</h2>

              <p className="mt-1 text-[11px] text-white/35">
                Messages from this meeting
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-xl px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.08] hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Messages */}
          <div
            ref={chatMessagesRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {chatLoading ? (
              <div className="flex h-full items-center justify-center text-xs text-white/35">
                Loading messages...
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <MessageCircle size={28} className="text-white/20" />

                <p className="mt-3 text-sm text-white/45">No messages yet</p>

                <p className="mt-1 text-xs text-white/25">
                  Start the conversation.
                </p>
              </div>
            ) : (
              chatMessages.map((message) => {
                const senderName = message.sender?.name ?? "Unknown";

                const isMine = message.senderId === localParticipant?.userId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[82%] ${
                        isMine ? "items-end" : "items-start"
                      }`}
                    >
                      {!isMine && (
                        <p className="mb-1 px-1 text-[11px] font-medium text-white/40">
                          {senderName}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? "rounded-br-md bg-[#1E8E5A] text-white"
                            : "rounded-bl-md bg-white/[0.07] text-white/85"
                        }`}
                      >
                        {message.content}
                      </div>

                      <p
                        className={`mt-1 px-1 text-[10px] text-white/25 ${
                          isMine ? "text-right" : "text-left"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-white/[0.08] p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-2">
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Message..."
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={sendMeetingChatMessage}
                disabled={!chatInput.trim() || !socket.connected}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E8E5A] text-white transition hover:bg-[#187A4B] disabled:cursor-not-allowed disabled:opacity-30"
                title="Send message"
              >
                <span className="text-sm">➤</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ================================================= */}
      {/* PARTICIPANTS PANEL */}
      {/* ================================================= */}

      {participantsOpen && (
        <div className="absolute inset-y-0 right-0 z-40 w-full max-w-[360px] border-l border-white/[0.08] bg-[#111318]/95 shadow-2xl backdrop-blur-xl">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Participants
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {participantCount}{" "}
                  {participantCount === 1 ? "participant" : "participants"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setParticipantsOpen(false)}
                className="rounded-xl px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>

            {/* Participant list */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {uniqueParticipants.map((participant) => {
                  const isYou = participant.socketId === localSocketId;

                  return (
                    <div
                      key={participant.userId}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-3"
                    >
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F8EF] text-sm font-semibold text-[#1E8E5A]">
                        {participant.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>

                      {/* Name */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {participant.name}
                        </p>

                        {isYou && (
                          <p className="mt-0.5 text-[11px] text-emerald-400">
                            You
                          </p>
                        )}
                      </div>

                      {/* Media status */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            participant.micEnabled
                              ? "bg-white/[0.06] text-white/70"
                              : "bg-red-500/10 text-red-400"
                          }`}
                          title={
                            participant.micEnabled
                              ? "Microphone on"
                              : "Microphone muted"
                          }
                        >
                          {participant.micEnabled ? (
                            <Mic size={15} />
                          ) : (
                            <MicOff size={15} />
                          )}
                        </div>

                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            participant.cameraEnabled
                              ? "bg-white/[0.06] text-white/70"
                              : "bg-red-500/10 text-red-400"
                          }`}
                          title={
                            participant.cameraEnabled
                              ? "Camera on"
                              : "Camera off"
                          }
                        >
                          {participant.cameraEnabled ? (
                            <Camera size={15} />
                          ) : (
                            <CameraOff size={15} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CONTROLS */}
      {/* ================================================= */}

      <footer className="flex h-24 shrink-0 items-center justify-center bg-[#0B0D11] px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-[#171A20] px-3 py-3 shadow-2xl">
          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={loading || !!error}
            title={micEnabled ? "Mute microphone" : "Unmute microphone"}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              micEnabled
                ? "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                : "bg-red-500 text-white hover:bg-red-600"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            disabled={loading || !!error}
            title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              cameraEnabled
                ? "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                : "bg-red-500 text-white hover:bg-red-600"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {cameraEnabled ? <Camera size={20} /> : <CameraOff size={20} />}
          </button>

          {/* Screen Share */}

          <button
            type="button"
            onClick={() => {
              if (isScreenSharing) {
                void stopScreenSharing();
              } else {
                void startScreenSharing();
              }
            }}
            disabled={loading || !!error}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              isScreenSharing
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-white/[0.07] text-white hover:bg-white/[0.12]"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            <MonitorUp size={20} />
          </button>

          <button
            type="button"
            onClick={leaveMeeting}
            className="ml-2 flex h-12 items-center gap-2 rounded-2xl bg-[#EF4444] px-5 text-sm font-medium text-white transition hover:bg-[#DC2626]"
          >
            <PhoneOff size={18} />

            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ========================================================= */
/* REMOTE VIDEO */
/* ========================================================= */

function RemoteVideo({ stream, participant }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  /*
   * =========================================================
   * ATTACH STREAM
   * =========================================================
   *
   * THE IMPORTANT FIX:
   *
   * The <video> element NEVER gets
   * unmounted when cameraEnabled changes.
   *
   * We only hide/show it.
   */

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !stream) {
      return;
    }

    /*
     * Don't unnecessarily replace
     * the MediaStream.
     */

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        /*
         * Chrome can throw AbortError when
         * play() is interrupted by another
         * media operation.
         */

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[WebRTC] remote video playback failed:", error);
      }
    };

    /*
     * Try immediately.
     */

    void playVideo();

    /*
     * Also try when metadata becomes
     * available.
     */

    const handleLoadedMetadata = () => {
      void playVideo();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    /*
     * DO NOT:
     *
     * video.srcObject = null
     *
     * during cleanup.
     *
     * The same MediaStream must remain
     * attached when the camera is toggled.
     */

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [stream]);

  /*
   * =========================================================
   * CAMERA STATE CHANGED
   * =========================================================
   *
   * When camera turns back ON,
   * explicitly ask the existing video
   * element to play again.
   */

  useEffect(() => {
    if (!participant.cameraEnabled) {
      return;
    }

    const video = videoRef.current;

    if (!video || !stream) {
      return;
    }

    const resumeVideo = async () => {
      try {
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }

        await video.play();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[WebRTC] failed to resume remote video:", error);
      }
    };

    void resumeVideo();
  }, [participant.cameraEnabled, stream]);

  return (
    <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
      {/* ================================================= */}
      {/* VIDEO */}
      {/* ================================================= */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover ${
          participant.cameraEnabled ? "block" : "hidden"
        }`}
      />

      {/* ================================================= */}
      {/* CAMERA OFF AVATAR */}
      {/* ================================================= */}

      {!participant.cameraEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#171A20]">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
            {participant.name?.charAt(0).toUpperCase() ?? "?"}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CAMERA STATUS */}
      {/* ================================================= */}

      <div
        className={`absolute left-4 top-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white backdrop-blur-md ${
          participant.cameraEnabled ? "bg-black/45" : "bg-red-500/80"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            participant.cameraEnabled ? "bg-[#52D88B]" : "bg-red-300"
          }`}
        />

        {participant.cameraEnabled ? "Camera on" : "Camera off"}
      </div>

      {/* ================================================= */}
      {/* MIC STATUS */}
      {/* ================================================= */}

      {!participant.micEnabled && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-red-500/80 px-3 py-2 text-xs text-white backdrop-blur-md">
          <MicOff size={13} />
          Muted
        </div>
      )}

      {/* ================================================= */}
      {/* NAME */}
      {/* ================================================= */}

      <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
        {participant.name}
      </div>
    </div>
  );
}

/* ========================================================= */
/* REMOTE WAITING TILE */
/* ========================================================= */

function RemoteWaitingTile({ participant }: { participant: Participant }) {
  return (
    <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E7F8EF] text-3xl font-semibold text-[#1E8E5A]">
          {participant.name?.charAt(0).toUpperCase() ?? "?"}
        </div>

        <p className="mt-4 text-sm text-white/50">Connecting...</p>
      </div>

      {!participant.micEnabled && (
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-xl bg-red-500/80 px-3 py-2 text-xs text-white backdrop-blur-md">
          <MicOff size={13} />
          Muted
        </div>
      )}

      <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
        {participant.name}
      </div>
    </div>
  );
}
