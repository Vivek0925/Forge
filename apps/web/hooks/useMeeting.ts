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
    useState<Record<string, MediaStream>>({});

  const [localSocketId, setLocalSocketId] =
    useState<string | null>(
      socket.id ?? null,
    );

  const streamRef =
    useRef<MediaStream | null>(stream);

  const peerConnections =
    useRef<
      Record<string, RTCPeerConnection>
    >({});

  const pendingIceCandidates =
    useRef<
      Record<
        string,
        RTCIceCandidateInit[]
      >
    >({});

  const joinedRef =
    useRef(false);

  const mountedRef =
    useRef(false);

  /*
   * =========================================================
   * KEEP LATEST STREAM
   * =========================================================
   */

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

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
   * ADD LOCAL TRACKS TO PEER
   * =========================================================
   */

  const addLocalTracksToPeer =
    useCallback(
      (
        peer: RTCPeerConnection,
      ) => {
        const localStream =
          streamRef.current;

        if (!localStream) {
          return;
        }

        const existingTrackIds =
          new Set(
            peer
              .getSenders()
              .map(
                (sender) =>
                  sender.track?.id,
              )
              .filter(Boolean),
          );

        localStream
          .getTracks()
          .forEach((track) => {
            if (
              existingTrackIds.has(
                track.id,
              )
            ) {
              return;
            }

            peer.addTrack(
              track,
              localStream,
            );
          });
      },
      [],
    );

  /*
   * =========================================================
   * CREATE PEER CONNECTION
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
          /*
           * Important:
           * If the peer was created before
           * media became available, add the
           * tracks now.
           */
          addLocalTracksToPeer(
            existing,
          );

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
         * Add local camera + microphone.
         */

        addLocalTracksToPeer(peer);

        /*
         * Remote media.
         */

        peer.ontrack = (event) => {
          const remoteStream =
            event.streams[0];

          if (!remoteStream) {
            return;
          }

          console.log(
            "[WebRTC] Remote stream received from:",
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
         */

        peer.onconnectionstatechange =
          () => {
            console.log(
              `[WebRTC] ${socketId}: ${peer.connectionState}`,
            );

            /*
             * Don't remove participants
             * just because WebRTC temporarily
             * disconnects.
             */

            if (
              peer.connectionState ===
              "failed"
            ) {
              console.warn(
                "[WebRTC] connection failed:",
                socketId,
              );

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
      [
        addLocalTracksToPeer,
        cleanupPeer,
      ],
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
              "[WebRTC] queued ICE failed:",
              error,
            );
          }
        }
      },
      [],
    );

  /*
   * =========================================================
   * ADD TRACKS WHEN STREAM BECOMES AVAILABLE
   * =========================================================
   */

  useEffect(() => {
    if (!stream) {
      return;
    }

    streamRef.current =
      stream;

    /*
     * If a peer already exists,
     * make sure it gets our tracks.
     */

    Object.values(
      peerConnections.current,
    ).forEach((peer) => {
      addLocalTracksToPeer(peer);
    });
  }, [
    stream,
    addLocalTracksToPeer,
  ]);

  /*
   * =========================================================
   * JOIN / SOCKET LISTENERS
   * =========================================================
   */

  useEffect(() => {
    /*
     * CRITICAL:
     *
     * Don't join until we have camera
     * and microphone tracks.
     */

    if (
      !meetingId ||
      !stream
    ) {
      return;
    }

    mountedRef.current =
      true;

    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      console.log(
        "[Meeting] authoritative participants:",
        data.participants,
      );

      setParticipants(
        data.participants,
      );
    }

    /*
     * Existing user receives this
     * when a new user joins.
     */

    async function handleParticipantJoined(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      const participant =
        data.participant;

      console.log(
        "[Meeting] participant joined:",
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

      /*
       * Existing participant creates
       * the offer.
       */

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
          "[WebRTC] offer creation failed:",
          error,
        );
      }
    }

    /*
     * MIC / CAMERA STATE
     */

    function handleParticipantState(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      console.log(
        "[Meeting] participant state:",
        data.participant,
      );

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
     * PARTICIPANT LEFT
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
     * MEETING ENDED
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

      joinedRef.current =
        false;
    }

    /*
     * ERROR
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

    async function handleOffer(data: {
      senderSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) {
      console.log(
        "[WebRTC] offer received from:",
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
          "[WebRTC] offer handling failed:",
          error,
        );
      }
    }

    /*
     * =========================================================
     * ANSWER
     * =========================================================
     */

    async function handleAnswer(data: {
      senderSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) {
      console.log(
        "[WebRTC] answer received from:",
        data.senderSocketId,
      );

      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (!peer) {
        console.warn(
          "[WebRTC] no peer for answer:",
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
          "[WebRTC] answer handling failed:",
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

      /*
       * Candidate can arrive before
       * remote description.
       *
       * Queue it.
       */

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
          "[WebRTC] ICE failed:",
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

    if (
      !joinedRef.current
    ) {
      console.log(
        "[Meeting] joining with media:",
        meetingId,
        stream.getTracks().length,
      );

      socket.emit(
        "meeting:join",
        {
          meetingId,
        },
      );

      joinedRef.current =
        true;
    }

    /*
     * =========================================================
     * SOCKET RECONNECT
     * =========================================================
     */

    const handleSocketConnect =
      () => {
        setLocalSocketId(
          socket.id ?? null,
        );

        console.log(
          "[Socket] connected:",
          socket.id,
        );

        /*
         * Socket.IO creates a new
         * socket id after reconnect.
         *
         * The server therefore needs
         * a fresh meeting join.
         */

        socket.emit(
          "meeting:join",
          {
            meetingId,
          },
        );

        joinedRef.current =
          true;
      };

    socket.on(
      "connect",
      handleSocketConnect,
    );

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    return () => {
      mountedRef.current =
        false;

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
       * Don't send leave during every
       * React effect cleanup.
       *
       * The component may simply be
       * re-rendering.
       */

      Object.keys(
        peerConnections.current,
      ).forEach((socketId) => {
        cleanupPeer(socketId);
      });

      setParticipants([]);
    };
  }, [
    meetingId,
    stream,
    createPeerConnection,
    cleanupPeer,
    flushIceCandidates,
  ]);

  /*
   * =========================================================
   * MIC / CAMERA STATE SYNC
   * =========================================================
   */

  useEffect(() => {
    if (
      !meetingId ||
      !joinedRef.current
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
   * LEAVE
   * =========================================================
   */

  const leaveMeeting =
    useCallback(() => {
      if (
        !meetingId ||
        !joinedRef.current
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

      joinedRef.current =
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
    localSocketId,
    leaveMeeting,
  };
}