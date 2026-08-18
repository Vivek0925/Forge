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
  Mic,
  MicOff,
  PhoneOff,
  Settings,
} from "lucide-react";

interface MeetingRoomProps {
  slug: string;
  meetingId: string;
}

export default function MeetingRoom({
  slug,
  meetingId,
}: MeetingRoomProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const [cameraEnabled, setCameraEnabled] =
    useState(true);

  const [micEnabled, setMicEnabled] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        setLoading(true);
        setError(null);

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            },
          );

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }

        setCameraEnabled(true);
        setMicEnabled(true);
      } catch (err) {
        console.error(
          "Failed to access camera/microphone:",
          err,
        );

        if (
          err instanceof DOMException &&
          err.name === "NotAllowedError"
        ) {
          setError(
            "Camera and microphone permission was denied. Please allow access and try again.",
          );
        } else if (
          err instanceof DOMException &&
          err.name === "NotFoundError"
        ) {
          setError(
            "No camera or microphone was found on this device.",
          );
        } else {
          setError(
            "Unable to access your camera or microphone.",
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

  function toggleCamera() {
    const videoTracks =
      streamRef.current?.getVideoTracks();

    if (!videoTracks?.length) return;

    const nextState = !cameraEnabled;

    videoTracks.forEach(
      (track) => {
        track.enabled = nextState;
      },
    );

    setCameraEnabled(nextState);
  }

  function toggleMicrophone() {
    const audioTracks =
      streamRef.current?.getAudioTracks();

    if (!audioTracks?.length) return;

    const nextState = !micEnabled;

    audioTracks.forEach(
      (track) => {
        track.enabled = nextState;
      },
    );

    setMicEnabled(nextState);
  }

  function leaveMeeting() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop(),
        );

      streamRef.current = null;
    }

    window.location.href = `/workspace/${slug}/meetings`;
  }

  return (
    <div className="flex h-screen flex-col bg-[#111318] text-white">
      {/* Header */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#17191F] px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              window.location.href = `/workspace/${slug}/meetings`
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-sm font-semibold">
              Meeting
            </p>

            <p className="text-xs text-white/40">
              {meetingId}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Main */}

      <main className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-3xl bg-[#1B1E25]">
          {/* Camera preview */}

          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                <p className="text-sm text-white/60">
                  Starting camera...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center px-6">
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

                <p className="mt-2 text-sm leading-6 text-white/50">
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
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-cover ${
                  cameraEnabled
                    ? ""
                    : "hidden"
                }`}
              />

              {!cameraEnabled && (
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
                    V
                  </div>
                </div>
              )}

              {/* Camera status */}

              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-xl bg-black/40 px-3 py-2 text-xs backdrop-blur-md">
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
            </>
          )}
        </div>
      </main>

      {/* Controls */}

      <footer className="flex h-24 shrink-0 items-center justify-center border-t border-white/10 bg-[#17191F]">
        <div className="flex items-center gap-3">
          {/* Mic */}

          <button
            type="button"
            onClick={toggleMicrophone}
            disabled={loading || !!error}
            title={
              micEnabled
                ? "Mute microphone"
                : "Unmute microphone"
            }
            className={`flex h-12 w-12 items-center bg-red-500 justify-center rounded-2xl transition ${
              micEnabled
                ? "bg-white/10 text-white hover:bg-white/15"
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
            disabled={loading || !!error}
            title={
              cameraEnabled
                ? "Turn camera off"
                : "Turn camera on"
            }
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition ${
              cameraEnabled
                ? "bg-white/10 text-white hover:bg-white/15"
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
            title="Leave meeting"
            className="ml-3 flex h-12 items-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            <PhoneOff size={19} />

            <span>Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
}