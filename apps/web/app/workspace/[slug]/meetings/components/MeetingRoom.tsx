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
  stream: MediaStream;
  name: string;
}

export default function MeetingRoom({
  slug,
  meetingId,
}: MeetingRoomProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

const {
  participants,
  remoteStreams,
} = useMeeting({
  meetingId,
  stream,
  micEnabled,
  cameraEnabled,
});

  const remoteParticipantCount =
    Object.keys(remoteStreams).length;

  /*
   * Start camera + microphone
   */
  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "Requesting camera...",
        );

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
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
            },
          );

        console.log(
          "Camera stream received:",
          mediaStream,
        );

        console.log(
          "Video tracks:",
          mediaStream.getVideoTracks(),
        );

        console.log(
          "Audio tracks:",
          mediaStream.getAudioTracks(),
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
            track.enabled = true;
          });

        mediaStream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled = true;
          });

        streamRef.current =
          mediaStream;

        setStream(mediaStream);
        setCameraEnabled(true);
        setMicEnabled(true);
      } catch (err) {
        console.error(
          "Media initialization failed:",
          err,
        );

        if (
          err instanceof DOMException &&
          err.name === "NotAllowedError"
        ) {
          setError(
            "Camera or microphone permission was denied. Please allow access to this site.",
          );
        } else if (
          err instanceof DOMException &&
          err.name === "NotFoundError"
        ) {
          setError(
            "No camera or microphone was found.",
          );
        } else if (
          err instanceof DOMException &&
          err.name === "NotReadableError"
        ) {
          setError(
            "Your camera may already be in use by another application.",
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
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        streamRef.current = null;
      }
    };
  }, []);

  /*
   * Attach local camera stream
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
    video.autoplay = true;
    video.playsInline = true;

    const playVideo = async () => {
      try {
        await video.play();

        console.log(
          "Video playback started",
        );
      } catch (err) {
        console.error(
          "Video playback failed:",
          err,
        );
      }
    };

    if (video.readyState >= 1) {
      playVideo();
    } else {
      video.onloadedmetadata =
        playVideo;
    }

    return () => {
      video.onloadedmetadata =
        null;
    };
  }, [stream]);

  /*
   * Fullscreen state
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

  /*
   * Fullscreen
   */
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
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
   * Camera
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
      track.enabled = nextState;
    });

    setCameraEnabled(nextState);
  }

  /*
   * Microphone
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
      track.enabled = nextState;
    });

    setMicEnabled(nextState);
  }

  /*
   * Leave meeting
   */
  async function leaveMeeting() {
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
        // Ignore fullscreen cleanup errors
      }
    }

    window.location.href =
      `/workspace/${slug}/meetings`;
  }

  /*
   * Participant count.
   *
   * +1 represents the current user.
   */
  const participantCount =
    participants.length + 1;

  /*
   * Grid layout.
   */
  const gridClass =
    remoteParticipantCount === 0
      ? "grid-cols-1"
      : remoteParticipantCount === 1
        ? "grid-cols-1 md:grid-cols-2"
        : remoteParticipantCount <= 3
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0B0D11] text-white">
      {/* ===================================================== */}
      {/* TOP BAR */}
      {/* ===================================================== */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111318]/95 px-5 backdrop-blur-xl">
        {/* Left */}

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
            <p className="truncate text-sm font-semibold text-white">
              Meeting
            </p>

            <p className="truncate text-xs text-white/35">
              {meetingId}
            </p>
          </div>
        </div>

        {/* Right */}

        <div className="flex items-center gap-2">
          {/* Participants */}

          <div className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60">
            <Users size={16} />

            <span>
              {participantCount}{" "}
              {participantCount === 1
                ? "participant"
                : "participants"}
            </span>
          </div>

          {/* Settings */}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          {/* Fullscreen */}

          <button
            type="button"
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? "Exit fullscreen"
                : "Enter fullscreen"
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.08] hover:text-white"
          >
            {isFullscreen ? (
              <Minimize size={18} />
            ) : (
              <Maximize size={18} />
            )}
          </button>
        </div>
      </header>

      {/* ===================================================== */}
      {/* VIDEO STAGE */}
      {/* ===================================================== */}

      <main className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
        <div
          className={`grid h-full w-full ${gridClass} gap-3`}
        >
          {/* ================================================= */}
          {/* LOCAL VIDEO */}
          {/* ================================================= */}

          <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
            {/* Loading */}

            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#171A20]">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white" />

                  <p className="text-sm text-white/50">
                    Starting camera...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}

            {!loading && error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                    <CameraOff
                      size={24}
                      className="text-red-400"
                    />
                  </div>

                  <h2 className="text-lg font-semibold">
                    Camera unavailable
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-[#20232D] transition hover:bg-white/90"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Camera */}

            {!error && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${
                    cameraEnabled
                      ? "block"
                      : "hidden"
                  }`}
                />

                {/* Camera off */}

                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#171A20]">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
                      V
                    </div>
                  </div>
                )}

                {/* Camera indicator */}

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-black/45 px-3 py-2 text-xs text-white backdrop-blur-md">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      cameraEnabled
                        ? "bg-[#52D88B]"
                        : "bg-red-400"
                    }`}
                  />

                  {cameraEnabled
                    ? "Camera on"
                    : "Camera off"}
                </div>

                {/* Name */}

                <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
                  You
                </div>
              </>
            )}
          </div>

          {/* ================================================= */}
          {/* REMOTE PARTICIPANTS */}
          {/* ================================================= */}

          {Object.entries(
            remoteStreams,
          ).map(
            ([
              socketId,
              remoteStream,
            ]) => {
              const participant =
                participants.find(
                  (item) =>
                    item.socketId ===
                    socketId,
                );

              return (
                <RemoteVideo
                  key={socketId}
                  stream={remoteStream}
                  name={
                    participant?.name ??
                    "Participant"
                  }
                />
              );
            },
          )}
        </div>
      </main>

      {/* ===================================================== */}
      {/* BOTTOM CONTROLS */}
      {/* ===================================================== */}

      <footer className="flex h-24 shrink-0 items-center justify-center bg-[#0B0D11] px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-[#171A20] px-3 py-3 shadow-2xl">
          {/* Microphone */}

          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={
              loading || !!error
            }
            title={
              micEnabled
                ? "Mute microphone"
                : "Unmute microphone"
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              micEnabled
                ? "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                : "bg-red-500 text-white hover:bg-red-600"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {micEnabled ? (
              <Mic size={20} />
            ) : (
              <MicOff size={20} />
            )}
          </button>

          {/* Camera */}

          <button
            type="button"
            onClick={toggleCamera}
            disabled={
              loading || !!error
            }
            title={
              cameraEnabled
                ? "Turn camera off"
                : "Turn camera on"
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              cameraEnabled
                ? "bg-white/[0.07] text-white hover:bg-white/[0.12]"
                : "bg-red-500 text-white hover:bg-red-600"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {cameraEnabled ? (
              <Camera size={20} />
            ) : (
              <CameraOff size={20} />
            )}
          </button>

          {/* Leave */}

          <button
            type="button"
            onClick={leaveMeeting}
            className="ml-2 flex h-12 items-center gap-2 rounded-2xl bg-[#EF4444] px-5 text-sm font-medium text-white transition hover:bg-[#DC2626]"
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
}: RemoteVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;

    video
      .play()
      .catch((error) => {
        console.error(
          "Failed to play remote video:",
          error,
        );
      });

    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />

      <div className="absolute left-4 top-4 rounded-xl bg-black/45 px-3 py-2 text-xs text-white backdrop-blur-md">
        Connected
      </div>

      <div className="absolute bottom-4 left-4 rounded-xl bg-black/50 px-3 py-2 text-xs text-white backdrop-blur-md">
        {name}
      </div>
    </div>
  );
}