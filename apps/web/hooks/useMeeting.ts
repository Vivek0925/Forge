"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "@/lib/socket";

export interface MeetingParticipant {
  socketId: string;
  userId: string;
  name: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

interface UseMeetingOptions {
  meetingId: string;
  stream: MediaStream | null;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

export function useMeeting({
  meetingId,
  stream,
  micEnabled,
  cameraEnabled,
}: UseMeetingOptions) {
  const [participants, setParticipants] =
    useState<MeetingParticipant[]>([]);

  const [remoteStreams, setRemoteStreams] =
    useState<
      Record<string, MediaStream>
    >({});

  const streamRef =
    useRef<MediaStream | null>(stream);

  const peerConnections =
    useRef<
      Record<
        string,
        RTCPeerConnection
      >
    >({});

  const pendingIceCandidates =
    useRef<
      Record<
        string,
        RTCIceCandidateInit[]
      >
    >({});

  const joinedMeetingRef =
    useRef(false);

  const micEnabledRef =
    useRef(micEnabled);

  const cameraEnabledRef =
    useRef(cameraEnabled);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    micEnabledRef.current =
      micEnabled;
  }, [micEnabled]);

  useEffect(() => {
    cameraEnabledRef.current =
      cameraEnabled;
  }, [cameraEnabled]);

  /*
   * =========================================================
   * CLEANUP PEER
   * =========================================================
   */

  const cleanupPeer = useCallback(
    (socketId: string) => {
      const peer =
        peerConnections.current[
          socketId
        ];

      if (peer) {
        try {
          peer.ontrack = null;
          peer.onicecandidate = null;
          peer.onconnectionstatechange =
            null;

          peer.close();
        } catch {
          // Ignore.
        }

        delete peerConnections.current[
          socketId
        ];
      }

      delete pendingIceCandidates.current[
        socketId
      ];

      setRemoteStreams((prev) => {
        if (!prev[socketId]) {
          return prev;
        }

        const next = {
          ...prev,
        };

        delete next[socketId];

        return next;
      });
    },
    [],
  );

  /*
   * =========================================================
   * CREATE PEER
   * =========================================================
   */

  const createPeerConnection =
    useCallback(
      (socketId: string) => {
        const existing =
          peerConnections.current[
            socketId
          ];

        if (existing) {
          return existing;
        }

        const peer =
          new RTCPeerConnection({
            iceServers: [
              {
                urls: [
                  "stun:stun.l.google.com:19302",
                  "stun:stun1.l.google.com:19302",
                ],
              },
            ],
          });

        /*
         * Add local tracks.
         */

        const localStream =
          streamRef.current;

        if (localStream) {
          localStream
            .getTracks()
            .forEach((track) => {
              peer.addTrack(
                track,
                localStream,
              );
            });
        }

        /*
         * Remote tracks.
         */

        peer.ontrack = (event) => {
          const remoteStream =
            event.streams[0];

          if (!remoteStream) {
            return;
          }

          console.log(
            "[WebRTC] Remote stream received:",
            socketId,
          );

          setRemoteStreams(
            (prev) => ({
              ...prev,
              [socketId]:
                remoteStream,
            }),
          );
        };

        /*
         * ICE.
         */

        peer.onicecandidate = (
          event,
        ) => {
          if (!event.candidate) {
            return;
          }

          socket.emit(
            "webrtc:ice-candidate",
            {
              targetSocketId:
                socketId,

              candidate:
                event.candidate.toJSON(),
            },
          );
        };

        /*
         * Connection state.
         *
         * IMPORTANT:
         *
         * A temporary "disconnected"
         * state does NOT mean the user
         * left the meeting.
         */

        peer.onconnectionstatechange =
          () => {
            console.log(
              `[WebRTC] ${socketId}:`,
              peer.connectionState,
            );

            if (
              peer.connectionState ===
              "failed"
            ) {
              cleanupPeer(
                socketId,
              );
            }

            if (
              peer.connectionState ===
              "closed"
            ) {
              cleanupPeer(
                socketId,
              );
            }
          };

        peerConnections.current[
          socketId
        ] = peer;

        return peer;
      },
      [cleanupPeer],
    );

  /*
   * =========================================================
   * FLUSH ICE
   * =========================================================
   */

  const flushIceCandidates =
    useCallback(
      async (
        socketId: string,
        peer: RTCPeerConnection,
      ) => {
        const candidates =
          pendingIceCandidates.current[
            socketId
          ];

        if (
          !candidates ||
          candidates.length === 0
        ) {
          return;
        }

        delete pendingIceCandidates.current[
          socketId
        ];

        for (const candidate of candidates) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(
                candidate,
              ),
            );
          } catch (error) {
            console.error(
              "[WebRTC] Failed queued ICE candidate:",
              error,
            );
          }
        }
      },
      [],
    );

  /*
   * =========================================================
   * MEETING SOCKET
   * =========================================================
   */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      console.log(
        "[Meeting] participants:",
        data.participants,
      );

      setParticipants(
        data.participants,
      );
    }

    /*
     * Existing participant receives
     * this when somebody new joins.
     *
     * Existing participant creates offer.
     */

    async function handleParticipantJoined(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      const participant =
        data.participant;

      console.log(
        "[Meeting] new participant:",
        participant,
      );

      setParticipants((prev) => {
        const exists =
          prev.some(
            (item) =>
              item.socketId ===
              participant.socketId,
          );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          participant,
        ];
      });

      const peer =
        createPeerConnection(
          participant.socketId,
        );

      try {
        const offer =
          await peer.createOffer();

        await peer.setLocalDescription(
          offer,
        );

        socket.emit(
          "webrtc:offer",
          {
            targetSocketId:
              participant.socketId,

            offer,
          },
        );
      } catch (error) {
        console.error(
          "[WebRTC] Failed to create offer:",
          error,
        );
      }
    }

    /*
     * Participant state.
     */

    function handleParticipantState(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId ===
          data.participant
            .socketId
            ? {
                ...participant,
                micEnabled:
                  data.participant
                    .micEnabled,
                cameraEnabled:
                  data.participant
                    .cameraEnabled,
              }
            : participant,
        ),
      );
    }

    /*
     * Participant left.
     */

    function handleParticipantLeft(
      data: {
        socketId: string;
        userId: string;
      },
    ) {
      console.log(
        "[Meeting] participant left:",
        data,
      );

      cleanupPeer(
        data.socketId,
      );

      setParticipants((prev) =>
        prev.filter(
          (participant) =>
            participant.socketId !==
            data.socketId,
        ),
      );
    }

    /*
     * Meeting ended.
     */

    function handleMeetingEnded(
      data: {
        meetingId: string;
        endedAt: string;
      },
    ) {
      if (
        data.meetingId !==
        meetingId
      ) {
        return;
      }

      Object.keys(
        peerConnections.current,
      ).forEach((socketId) => {
        cleanupPeer(socketId);
      });

      setParticipants([]);

      joinedMeetingRef.current =
        false;
    }

    /*
     * Meeting error.
     */

    function handleMeetingError(
      data: {
        message: string;
      },
    ) {
      console.error(
        "[Meeting] error:",
        data.message,
      );
    }

    /*
     * =========================================================
     * OFFER
     * =========================================================
     */

    async function handleOffer(
      data: {
        senderSocketId: string;
        offer: RTCSessionDescriptionInit;
      },
    ) {
      console.log(
        "[WebRTC] offer received:",
        data.senderSocketId,
      );

      const peer =
        createPeerConnection(
          data.senderSocketId,
        );

      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(
            data.offer,
          ),
        );

        await flushIceCandidates(
          data.senderSocketId,
          peer,
        );

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer,
        );

        socket.emit(
          "webrtc:answer",
          {
            targetSocketId:
              data.senderSocketId,

            answer,
          },
        );
      } catch (error) {
        console.error(
          "[WebRTC] Failed to handle offer:",
          error,
        );
      }
    }

    /*
     * =========================================================
     * ANSWER
     * =========================================================
     */

    async function handleAnswer(
      data: {
        senderSocketId: string;
        answer: RTCSessionDescriptionInit;
      },
    ) {
      console.log(
        "[WebRTC] answer received:",
        data.senderSocketId,
      );

      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (!peer) {
        console.warn(
          "[WebRTC] No peer for answer:",
          data.senderSocketId,
        );

        return;
      }

      try {
        await peer.setRemoteDescription(
          new RTCSessionDescription(
            data.answer,
          ),
        );

        await flushIceCandidates(
          data.senderSocketId,
          peer,
        );
      } catch (error) {
        console.error(
          "[WebRTC] Failed to set answer:",
          error,
        );
      }
    }

    /*
     * =========================================================
     * ICE
     * =========================================================
     */

    async function handleICECandidate(
      data: {
        senderSocketId: string;
        candidate: RTCIceCandidateInit;
      },
    ) {
      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (
        !peer ||
        !peer.remoteDescription
      ) {
        if (
          !pendingIceCandidates.current[
            data.senderSocketId
          ]
        ) {
          pendingIceCandidates.current[
            data.senderSocketId
          ] = [];
        }

        pendingIceCandidates.current[
          data.senderSocketId
        ].push(
          data.candidate,
        );

        return;
      }

      try {
        await peer.addIceCandidate(
          new RTCIceCandidate(
            data.candidate,
          ),
        );
      } catch (error) {
        console.error(
          "[WebRTC] Failed to add ICE candidate:",
          error,
        );
      }
    }

    /*
     * =========================================================
     * SOCKET LISTENERS
     * =========================================================
     */

    socket.on(
      "meeting:participants",
      handleParticipants,
    );

    socket.on(
      "meeting:participant-joined",
      handleParticipantJoined,
    );

    socket.on(
      "meeting:participant-state",
      handleParticipantState,
    );

    socket.on(
      "meeting:participant-left",
      handleParticipantLeft,
    );

    socket.on(
      "meeting:ended",
      handleMeetingEnded,
    );

    socket.on(
      "meeting:error",
      handleMeetingError,
    );

    socket.on(
      "webrtc:offer",
      handleOffer,
    );

    socket.on(
      "webrtc:answer",
      handleAnswer,
    );

    socket.on(
      "webrtc:ice-candidate",
      handleICECandidate,
    );

    /*
     * =========================================================
     * JOIN
     * =========================================================
     */

    function joinMeeting() {
      if (
        socket.connected ||
        !joinedMeetingRef.current
      ) {
        console.log(
          "[Meeting] joining:",
          meetingId,
        );

        socket.emit(
          "meeting:join",
          {
            meetingId,
          },
        );

        joinedMeetingRef.current =
          true;
      }
    }

    /*
     * Initial join.
     */

    joinMeeting();

    /*
     * If Socket.IO reconnects,
     * rejoin the meeting.
     */

    const handleSocketConnect =
      () => {
        console.log(
          "[Socket] connected:",
          socket.id,
        );

        socket.emit(
          "meeting:join",
          {
            meetingId,
          },
        );

        joinedMeetingRef.current =
          true;
      };

    socket.on(
      "connect",
      handleSocketConnect,
    );

    /*
     * Cleanup.
     */

    return () => {
      socket.off(
        "meeting:participants",
        handleParticipants,
      );

      socket.off(
        "meeting:participant-joined",
        handleParticipantJoined,
      );

      socket.off(
        "meeting:participant-state",
        handleParticipantState,
      );

      socket.off(
        "meeting:participant-left",
        handleParticipantLeft,
      );

      socket.off(
        "meeting:ended",
        handleMeetingEnded,
      );

      socket.off(
        "meeting:error",
        handleMeetingError,
      );

      socket.off(
        "webrtc:offer",
        handleOffer,
      );

      socket.off(
        "webrtc:answer",
        handleAnswer,
      );

      socket.off(
        "webrtc:ice-candidate",
        handleICECandidate,
      );

      socket.off(
        "connect",
        handleSocketConnect,
      );

      /*
       * IMPORTANT:
       *
       * The hook is leaving the meeting
       * because the meeting component
       * itself is being destroyed.
       *
       * This keeps the server room accurate.
       */

      if (
        joinedMeetingRef.current
      ) {
        socket.emit(
          "meeting:leave",
          {
            meetingId,
          },
        );
      }

      joinedMeetingRef.current =
        false;

      Object.keys(
        peerConnections.current,
      ).forEach((socketId) => {
        cleanupPeer(socketId);
      });

      setParticipants([]);
    };
  }, [
    meetingId,
    createPeerConnection,
    cleanupPeer,
    flushIceCandidates,
  ]);

  /*
   * =========================================================
   * LOCAL STATE SYNC
   * =========================================================
   */

  useEffect(() => {
    if (
      !meetingId ||
      !joinedMeetingRef.current
    ) {
      return;
    }

    socket.emit(
      "meeting:participant-state",
      {
        meetingId,
        micEnabled,
        cameraEnabled,
      },
    );
  }, [
    meetingId,
    micEnabled,
    cameraEnabled,
  ]);

  /*
   * =========================================================
   * EXPLICIT LEAVE
   * =========================================================
   */

  const leaveMeeting = useCallback(() => {
    if (!meetingId) {
      return;
    }

    if (
      !joinedMeetingRef.current
    ) {
      return;
    }

    console.log(
      "[Meeting] leaving:",
      meetingId,
    );

    socket.emit(
      "meeting:leave",
      {
        meetingId,
      },
    );

    joinedMeetingRef.current =
      false;

    Object.keys(
      peerConnections.current,
    ).forEach((socketId) => {
      cleanupPeer(socketId);
    });

    setParticipants([]);
  }, [
    meetingId,
    cleanupPeer,
  ]);

  return {
    participants,
    remoteStreams,
    leaveMeeting,
  };
}