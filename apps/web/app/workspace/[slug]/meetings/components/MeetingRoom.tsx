"use client";

import { useEffect, useRef, useState } from "react";

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

export default function MeetingRoom({
  slug,
  meetingId,
}: MeetingRoomProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

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

  const [cameraEnabled, setCameraEnabled] =
    useState<boolean>(() => {
      if (typeof window === "undefined") {
        return true;
      }

      try {
        const saved =
          localStorage.getItem(
            `meeting-settings-${meetingId}`,
          );

        if (!saved) {
          return true;
        }

        const settings = JSON.parse(saved);

        return typeof settings.cameraEnabled ===
          "boolean"
          ? settings.cameraEnabled
          : true;
      } catch {
        return true;
      }
    });

  const [micEnabled, setMicEnabled] =
    useState<boolean>(() => {
      if (typeof window === "undefined") {
        return true;
      }

      try {
        const saved =
          localStorage.getItem(
            `meeting-settings-${meetingId}`,
          );

        if (!saved) {
          return true;
        }

        const settings = JSON.parse(saved);

        return typeof settings.micEnabled ===
          "boolean"
          ? settings.micEnabled
          : true;
      } catch {
        return true;
      }
    });

  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

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
   * MEETING HOOK
   * =========================================================
   */

  const {
    participants,
    remoteStreams,
    localSocketId,
    leaveMeeting: leaveSocketMeeting,
  } = useMeeting({
    meetingId,
    stream,
    micEnabled,
    cameraEnabled,
  });

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

        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
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
          mediaStream
            .getTracks()
            .forEach((track) => track.stop());

          return;
        }

        /*
         * Apply the saved/current state
         * immediately to the tracks.
         */

        mediaStream
          .getVideoTracks()
          .forEach((track) => {
            track.enabled = cameraEnabled;
          });

        mediaStream
          .getAudioTracks()
          .forEach((track) => {
            track.enabled = micEnabled;
          });

        streamRef.current =
          mediaStream;

        setStream(mediaStream);

        console.log(
          "[Meeting] local media initialized",
          {
            cameraEnabled,
            micEnabled,
            tracks:
              mediaStream
                .getTracks()
                .map(
                  (track) =>
                    `${track.kind}:${track.enabled}`,
                ),
          },
        );
      } catch (err) {
        console.error(
          "[Meeting] media initialization failed:",
          err,
        );

        if (
          err instanceof DOMException &&
          err.name ===
            "NotAllowedError"
        ) {
          setError(
            "Camera or microphone permission was denied. Please allow access to this site.",
          );
        } else if (
          err instanceof DOMException &&
          err.name ===
            "NotFoundError"
        ) {
          setError(
            "No camera or microphone was found.",
          );
        } else if (
          err instanceof DOMException &&
          err.name ===
            "NotReadableError"
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
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

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
    const video =
      videoRef.current;

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
        if (
          err instanceof DOMException &&
          err.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "[Meeting] local video playback failed:",
          err,
        );
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

  /*
   * =========================================================
   * FULLSCREEN
   * =========================================================
   */

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement ===
          containerRef.current,
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
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(
        "Fullscreen error:",
        err,
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
      track.enabled = nextState;
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
    /*
     * Tell the socket layer first.
     */
    leaveSocketMeeting();

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
        // Ignore fullscreen cleanup.
      }
    }

    window.location.href =
      `/workspace/${slug}/meetings`;
  }

  /*
   * =========================================================
   * PARTICIPANT COUNT
   * =========================================================
   */

  const participantCount =
    participants.length;

  /*
   * =========================================================
   * REMOTE PARTICIPANTS
   * =========================================================
   *
   * IMPORTANT:
   *
   * Use localSocketId to remove OUR
   * participant from the remote list.
   *
   * Do NOT use participant name.
   */

  const remoteParticipants =
    participants.filter(
      (participant) =>
        participant.socketId !==
        localSocketId,
    );

  /*
   * =========================================================
   * GRID
   * =========================================================
   *
   * The grid is based on PARTICIPANTS,
   * not remoteStreams.
   *
   * That means a participant gets a tile
   * immediately, even while WebRTC is connecting.
   */

  const totalVideoTiles =
    1 + remoteParticipants.length;

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
              (window.location.href =
                `/workspace/${slug}/meetings`)
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            title="Back to meetings"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            title="Settings"
          >
            <Settings size={18} />
          </button>

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

      {/* ================================================= */}
      {/* VIDEO STAGE */}
      {/* ================================================= */}

      <main className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-5">
        <div
          className={`grid h-full min-h-0 w-full ${gridClass} gap-3`}
        >
          {/* ============================================= */}
          {/* LOCAL VIDEO */}
          {/* ============================================= */}

          <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
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
                      cameraEnabled
                        ? "bg-[#52D88B]"
                        : "bg-red-400"
                    }`}
                  />

                  {cameraEnabled
                    ? "Camera on"
                    : "Camera off"}
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

          {remoteParticipants.map(
            (participant) => {
              const remoteStream =
                remoteStreams[
                  participant.socketId
                ];

              /*
               * IMPORTANT:
               *
               * Participant exists but WebRTC
               * stream hasn't arrived yet.
               *
               * Render a waiting tile instead
               * of making the participant disappear.
               */

              if (!remoteStream) {
                return (
                  <RemoteWaitingTile
                    key={
                      participant.socketId
                    }
                    participant={
                      participant
                    }
                  />
                );
              }

              return (
                <RemoteVideo
                  key={
                    participant.socketId
                  }
                  stream={remoteStream}
                  participant={
                    participant
                  }
                />
              );
            },
          )}
        </div>
      </main>

      {/* ================================================= */}
      {/* CONTROLS */}
      {/* ================================================= */}

      <footer className="flex h-24 shrink-0 items-center justify-center bg-[#0B0D11] px-4">
        <div className="flex items-center gap-3 rounded-3xl border border-white/[0.08] bg-[#171A20] px-3 py-3 shadow-2xl">
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
  participant,
}: RemoteVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

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
    const video =
      videoRef.current;

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

        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "[WebRTC] remote video playback failed:",
          error,
        );
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

    const handleLoadedMetadata =
      () => {
        void playVideo();
      };

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata,
    );

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
      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );
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
    if (
      !participant.cameraEnabled
    ) {
      return;
    }

    const video =
      videoRef.current;

    if (!video || !stream) {
      return;
    }

    const resumeVideo = async () => {
      try {
        if (
          video.srcObject !== stream
        ) {
          video.srcObject = stream;
        }

        await video.play();
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "[WebRTC] failed to resume remote video:",
          error,
        );
      }
    };

    void resumeVideo();
  }, [
    participant.cameraEnabled,
    stream,
  ]);

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
          participant.cameraEnabled
            ? "block"
            : "hidden"
        }`}
      />

      {/* ================================================= */}
      {/* CAMERA OFF AVATAR */}
      {/* ================================================= */}

      {!participant.cameraEnabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#171A20]">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#E7F8EF] text-4xl font-semibold text-[#1E8E5A]">
            {participant.name
              ?.charAt(0)
              .toUpperCase() ?? "?"}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* CAMERA STATUS */}
      {/* ================================================= */}

      <div
        className={`absolute left-4 top-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-white backdrop-blur-md ${
          participant.cameraEnabled
            ? "bg-black/45"
            : "bg-red-500/80"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            participant.cameraEnabled
              ? "bg-[#52D88B]"
              : "bg-red-300"
          }`}
        />

        {participant.cameraEnabled
          ? "Camera on"
          : "Camera off"}
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

function RemoteWaitingTile({
  participant,
}: {
  participant: Participant;
}) {
  return (
    <div className="relative min-h-0 overflow-hidden rounded-3xl bg-[#171A20]">
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#E7F8EF] text-3xl font-semibold text-[#1E8E5A]">
          {participant.name
            ?.charAt(0)
            .toUpperCase() ?? "?"}
        </div>

        <p className="mt-4 text-sm text-white/50">
          Connecting...
        </p>
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