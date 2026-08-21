"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  Users,
} from "lucide-react";

import { useMeeting } from "@/hooks/useMeeting";

interface MeetingRoomProps {
  slug: string;
  meetingId: string;
}

interface RemoteVideoProps {
  stream?: MediaStream;
  name: string;
  cameraEnabled: boolean;
  micEnabled: boolean;
}

interface SavedMeetingSettings {
  cameraEnabled: boolean;
  micEnabled: boolean;
}

function getSavedSettings(
  meetingId: string,
): SavedMeetingSettings {
  if (typeof window === "undefined") {
    return {
      cameraEnabled: true,
      micEnabled: true,
    };
  }

  try {
    const saved =
      localStorage.getItem(
        `meeting-settings-${meetingId}`,
      );

    if (!saved) {
      return {
        cameraEnabled: true,
        micEnabled: true,
      };
    }

    const settings =
      JSON.parse(saved);

    return {
      cameraEnabled:
        typeof settings.cameraEnabled ===
        "boolean"
          ? settings.cameraEnabled
          : true,

      micEnabled:
        typeof settings.micEnabled ===
        "boolean"
          ? settings.micEnabled
          : true,
    };
  } catch {
    return {
      cameraEnabled: true,
      micEnabled: true,
    };
  }
}

export default function MeetingRoom({
  slug,
  meetingId,
}: MeetingRoomProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const savedSettings =
    getSavedSettings(meetingId);

  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [cameraEnabled, setCameraEnabled] =
    useState(
      savedSettings.cameraEnabled,
    );

  const [micEnabled, setMicEnabled] =
    useState(
      savedSettings.micEnabled,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const {
    participants,
    remoteStreams,
    leaveMeeting,
  } = useMeeting({
    meetingId,
    stream,
    micEnabled,
    cameraEnabled,
  });

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
  }, [
    meetingId,
    cameraEnabled,
    micEnabled,
  ]);

  /*
   * =========================================================
   * MEDIA
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        setLoading(true);
        setError(null);

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            },
          );

        if (!mounted) {
          mediaStream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          return;
        }

        mediaStream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled =
              savedSettings.cameraEnabled;
          });

        mediaStream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled =
              savedSettings.micEnabled;
          });

        streamRef.current =
          mediaStream;

        setStream(mediaStream);

        setCameraEnabled(
          savedSettings.cameraEnabled,
        );

        setMicEnabled(
          savedSettings.micEnabled,
        );
      } catch (err) {
        console.error(
          "[MeetingRoom] media error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to access camera and microphone.",
        );
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
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        streamRef.current = null;
      }
    };
  }, [meetingId]);

  /*
   * =========================================================
   * LOCAL VIDEO
   * =========================================================
   */

  useEffect(() => {
    if (
      !stream ||
      !videoRef.current
    ) {
      return;
    }

    const video =
      videoRef.current;

    video.srcObject = stream;
    video.muted = true;

    video.play().catch(() => {});

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  /*
   * =========================================================
   * FULLSCREEN
   * =========================================================
   */

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement !==
          null,
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  async function toggleFullscreen() {
    try {
      if (
        !document.fullscreenElement
      ) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error,
      );
    }
  }

  /*
   * =========================================================
   * CAMERA
   * =========================================================
   */

  function toggleCamera() {
    const tracks =
      streamRef.current?.getVideoTracks();

    if (!tracks?.length) {
      return;
    }

    const nextState =
      !cameraEnabled;

    tracks.forEach((track) => {
      track.enabled =
        nextState;
    });

    setCameraEnabled(nextState);
  }

  /*
   * =========================================================
   * MICROPHONE
   * =========================================================
   */

  function toggleMicrophone() {
    const tracks =
      streamRef.current?.getAudioTracks();

    if (!tracks?.length) {
      return;
    }

    const nextState =
      !micEnabled;

    tracks.forEach((track) => {
      track.enabled =
        nextState;
    });

    setMicEnabled(nextState);
  }

  /*
   * =========================================================
   * LEAVE
   * =========================================================
   */

  async function handleLeaveMeeting() {
    leaveMeeting();

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop(),
        );

      streamRef.current = null;
    }

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore.
      }
    }

    window.location.href =
      `/workspace/${slug}/meetings`;
  }

  /*
   * =========================================================
   * PARTICIPANTS
   * =========================================================
   */

  const participantCount =
    participants.length;

  /*
   * Exclude current user's socket.
   *
   * We identify the local participant
   * by whether a participant does NOT
   * have a remote stream.
   *
   * The local video is rendered separately.
   */

  const remoteParticipants =
    participants.filter(
      (participant) =>
        remoteStreams[
          participant.socketId
        ] ||
        participant.socketId !==
          participants[0]?.socketId,
    );

  /*
   * =========================================================
   * GRID
   * =========================================================
   */

  const totalTiles =
    1 + remoteParticipants.length;

  const gridClass =
    totalTiles <= 1
      ? "grid-cols-1"
      : totalTiles === 2
        ? "grid-cols-1 md:grid-cols-2"
        : totalTiles <= 4
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0B0D11] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111318]/95 px-5 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() =>
              (window.location.href =
                `/workspace/${slug}/meetings`)
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Meeting
            </p>

            <p className="truncate text-xs text-white/35">
              {meetingId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60">
            <Users size={16} />

            <span>
              {participantCount}{" "}
              {participantCount === 1
                ? "participant"
                : "participants"}
            </span>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white"
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 hover:bg-white/[0.08] hover:text-white"
          >
            {isFullscreen ? (
              <Minimize size={18} />
            ) : (
              <Maximize size={18} />
            )}
          </button>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
        <div
          className={`grid h-full w-full ${gridClass} gap-3`}
        >
          {/* LOCAL */}

          <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />
              </div>
            ) : cameraEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
                  V
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs backdrop-blur-md">
              You
            </div>

            {!micEnabled && (
              <div className="absolute bottom-4 right-4 rounded-xl bg-red-500/80 px-3 py-2 text-xs">
                🔇 Muted
              </div>
            )}
          </div>

          {/* REMOTE PARTICIPANTS */}

          {remoteParticipants.map(
            (participant) => (
              <RemoteVideo
                key={
                  participant.socketId
                }
                stream={
                  remoteStreams[
                    participant.socketId
                  ]
                }
                name={
                  participant.name
                }
                cameraEnabled={
                  participant.cameraEnabled
                }
                micEnabled={
                  participant.micEnabled
                }
              />
            ),
          )}
        </div>
      </main>

      <footer className="flex h-24 shrink-0 items-center justify-center bg-[#0B0D11] px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-[#171A20] px-3 py-3 shadow-2xl">
          <button
            type="button"
            onClick={
              toggleMicrophone
            }
            disabled={
              loading || !!error
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              micEnabled
                ? "bg-white/[0.07]"
                : "bg-red-500"
            }`}
          >
            {micEnabled ? (
              <Mic size={20} />
            ) : (
              <MicOff size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            disabled={
              loading || !!error
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              cameraEnabled
                ? "bg-white/[0.07]"
                : "bg-red-500"
            }`}
          >
            {cameraEnabled ? (
              <Camera size={20} />
            ) : (
              <CameraOff size={20} />
            )}
          </button>

          <button
            type="button"
            onClick={
              handleLeaveMeeting
            }
            className="ml-2 flex h-12 items-center gap-2 rounded-2xl bg-[#EF4444] px-5 text-sm font-medium"
          >
            <PhoneOff size={18} />

            <span className="hidden sm:inline">
              Leave
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ========================================================= */
/* REMOTE VIDEO */
/* ========================================================= */

function RemoteVideo({
  stream,
  name,
  cameraEnabled,
  micEnabled,
}: RemoteVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    if (stream) {
      video.srcObject = stream;

      video.play().catch(() => {});
    }

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
      {stream &&
      cameraEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
            {name
              .charAt(0)
              .toUpperCase()}
          </div>

          {!stream && (
            <p className="mt-4 text-xs text-white/35">
              Connecting...
            </p>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs backdrop-blur-md">
        {name}
      </div>

      {!micEnabled && (
        <div className="absolute bottom-4 right-4 rounded-xl bg-red-500/80 px-3 py-2 text-xs">
          🔇 Muted
        </div>
      )}
    </div>
  );
}