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

  /*
   * Start camera + microphone
   */
  useEffect(() => {
    let mounted = true;

    async function startMedia() {
      try {
        setLoading(true);
        setError(null);

        console.log("Requesting camera...");

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
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
            "Camera or microphone permission was denied. Please allow access to localhost:3000.",
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
        console.log(
          "Stopping media tracks",
        );

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
   * Attach stream AFTER video element
   * has been rendered.
   */
  useEffect(() => {
    if (!stream || !videoRef.current) {
      return;
    }

    const video =
      videoRef.current;

    console.log(
      "Attaching stream to video element...",
    );

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
      video.onloadedmetadata = null;
    };
  }, [stream]);

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

  function leaveMeeting() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop(),
        );

      streamRef.current = null;
    }

    window.location.href =
      `/workspace/${slug}/meetings`;
  }

  return (
    <div className="flex h-screen flex-col bg-[#111318] text-white">
      {/* Header */}

      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#17191F] px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              (window.location.href =
                `/workspace/${slug}/meetings`)
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
              {/* Video */}

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

              {/* Camera disabled */}

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
            className="ml-3 flex h-12 items-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            <PhoneOff size={19} />
            Leave
          </button>
        </div>
      </footer>
    </div>
  );
}