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
    useState<MeetingParticipant[]>(
      [],
    );

  const [remoteStreams, setRemoteStreams] =
    useState<
      Record<string, MediaStream>
    >({});

  const [localSocketId, setLocalSocketId] =
    useState<string | null>(
      socket.id ?? null,
    );

  const streamRef =
    useRef<MediaStream | null>(
      stream,
    );

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

  const joinedRef =
    useRef(false);

  const mountedRef =
    useRef(false);

  /*
   * =========================================================
   * STREAM
   * =========================================================
   */

  useEffect(() => {
    streamRef.current = stream;

    if (!stream) {
      return;
    }

    /*
     * If peer connections already exist,
     * make sure the new stream tracks
     * are attached.
     */
    Object.values(
      peerConnections.current,
    ).forEach((peer) => {
      addLocalTracksToPeer(peer);
    });
  }, [stream]);

  /*
   * =========================================================
   * CLEANUP PEER
   * =========================================================
   */

  const cleanupPeer =
    useCallback(
      (socketId: string) => {
        const peer =
          peerConnections.current[
            socketId
          ];

        if (peer) {
          try {
            peer.ontrack = null;
            peer.onicecandidate =
              null;
            peer.onconnectionstatechange =
              null;

            peer.close();
          } catch {
            // Ignore close errors.
          }

          delete peerConnections.current[
            socketId
          ];
        }

        delete pendingIceCandidates
          .current[socketId];

        setRemoteStreams(
          (previous) => {
            if (
              !previous[socketId]
            ) {
              return previous;
            }

            const next = {
              ...previous,
            };

            delete next[socketId];

            return next;
          },
        );
      },
      [],
    );

  /*
   * =========================================================
   * ADD LOCAL TRACKS
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

        const currentTrackIds =
          new Set(
            peer
              .getSenders()
              .map(
                (sender) =>
                  sender.track?.id,
              )
              .filter(
                (
                  id,
                ): id is string =>
                  Boolean(id),
              ),
          );

        localStream
          .getTracks()
          .forEach((track) => {
            if (
              currentTrackIds.has(
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
         * IMPORTANT:
         * Add camera + microphone BEFORE
         * creating offer/answer.
         */
        addLocalTracksToPeer(peer);

        /*
         * Remote stream.
         */
        peer.ontrack = (
          event,
        ) => {
          const remoteStream =
            event.streams[0];

          if (!remoteStream) {
            return;
          }

          console.log(
            "[WebRTC] remote stream:",
            socketId,
            remoteStream
              .getTracks()
              .map(
                (track) =>
                  `${track.kind}:${track.enabled}`,
              ),
          );

          setRemoteStreams(
            (previous) => ({
              ...previous,
              [socketId]:
                remoteStream,
            }),
          );
        };

        /*
         * ICE.
         */
        peer.onicecandidate =
          (event) => {
            if (
              !event.candidate
            ) {
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

            if (
              peer.connectionState ===
              "failed"
            ) {
              console.warn(
                "[WebRTC] failed:",
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
   * ICE QUEUE
   * =========================================================
   */

  const flushIceCandidates =
    useCallback(
      async (
        socketId: string,
        peer: RTCPeerConnection,
      ) => {
        const candidates =
          pendingIceCandidates
            .current[
            socketId
          ];

        if (
          !candidates ||
          candidates.length === 0
        ) {
          return;
        }

        delete pendingIceCandidates
          .current[socketId];

        for (const candidate of candidates) {
          try {
            await peer.addIceCandidate(
              new RTCIceCandidate(
                candidate,
              ),
            );
          } catch (error) {
            console.error(
              "[WebRTC] queued ICE error:",
              error,
            );
          }
        }
      },
      [],
    );

  /*
   * =========================================================
   * JOIN + SOCKET EVENTS
   * =========================================================
   */

  useEffect(() => {
    /*
     * THIS IS THE IMPORTANT FIX.
     *
     * Do NOT join before getUserMedia()
     * has produced the stream.
     */
    if (
      !meetingId ||
      !stream
    ) {
      return;
    }

    mountedRef.current =
      true;

    /*
     * -------------------------------------------------------
     * AUTHORITATIVE PARTICIPANT LIST
     * -------------------------------------------------------
     */

    const handleParticipants =
      (data: {
        participants: MeetingParticipant[];
      }) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        console.log(
          "[Meeting] participants:",
          data.participants,
        );

        setParticipants(
          data.participants,
        );
      };

    /*
     * -------------------------------------------------------
     * EXISTING PARTICIPANTS
     * -------------------------------------------------------
     *
     * New user gets this list.
     *
     * Existing users do not need to
     * create duplicate offers.
     */

    const handleExistingParticipants =
      (data: {
        participants: MeetingParticipant[];
      }) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        console.log(
          "[Meeting] existing participants:",
          data.participants,
        );

        setParticipants(
          (previous) => {
            const map =
              new Map<
                string,
                MeetingParticipant
              >();

            previous.forEach(
              (participant) => {
                map.set(
                  participant.socketId,
                  participant,
                );
              },
            );

            data.participants.forEach(
              (participant) => {
                map.set(
                  participant.socketId,
                  participant,
                );
              },
            );

            return Array.from(
              map.values(),
            );
          },
        );
      };

    /*
     * -------------------------------------------------------
     * NEW PARTICIPANT
     * -------------------------------------------------------
     *
     * This is received by existing
     * participants.
     *
     * Existing participant creates
     * offer.
     */

    const handleParticipantJoined =
      async (data: {
        participant: MeetingParticipant;
      }) => {
        const participant =
          data.participant;

        console.log(
          "[Meeting] participant joined:",
          participant,
        );

        setParticipants(
          (previous) => {
            const exists =
              previous.some(
                (item) =>
                  item.socketId ===
                  participant.socketId,
              );

            if (exists) {
              return previous.map(
                (item) =>
                  item.socketId ===
                  participant.socketId
                    ? participant
                    : item,
              );
            }

            return [
              ...previous,
              participant,
            ];
          },
        );

        /*
         * Never create a peer with ourselves.
         */
        if (
          participant.socketId ===
          socket.id
        ) {
          return;
        }

        const peer =
          createPeerConnection(
            participant.socketId,
          );

        try {
          /*
           * Tracks are already attached.
           */
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
            "[WebRTC] create offer failed:",
            error,
          );
        }
      };

    /*
     * -------------------------------------------------------
     * PARTICIPANT STATE
     * -------------------------------------------------------
     */

    const handleParticipantState =
      (data: {
        participant: MeetingParticipant;
      }) => {
        console.log(
          "[Meeting] state update:",
          data.participant,
        );

        setParticipants(
          (previous) =>
            previous.map(
              (participant) =>
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
      };

    /*
     * -------------------------------------------------------
     * PARTICIPANT LEFT
     * -------------------------------------------------------
     */

    const handleParticipantLeft =
      (data: {
        socketId: string;
        userId: string;
      }) => {
        console.log(
          "[Meeting] participant left:",
          data,
        );

        cleanupPeer(
          data.socketId,
        );

        setParticipants(
          (previous) =>
            previous.filter(
              (participant) =>
                participant.socketId !==
                data.socketId,
            ),
        );
      };

    /*
     * -------------------------------------------------------
     * MEETING ENDED
     * -------------------------------------------------------
     */

    const handleMeetingEnded =
      (data: {
        meetingId: string;
        endedAt: string;
      }) => {
        if (
          data.meetingId !==
          meetingId
        ) {
          return;
        }

        Object.keys(
          peerConnections.current,
        ).forEach(
          (socketId) => {
            cleanupPeer(
              socketId,
            );
          },
        );

        setParticipants([]);

        joinedRef.current =
          false;
      };

    /*
     * -------------------------------------------------------
     * OFFER
     * -------------------------------------------------------
     */

    const handleOffer =
      async (data: {
        senderSocketId: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        console.log(
          "[WebRTC] offer from:",
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
            "[WebRTC] handle offer failed:",
            error,
          );
        }
      };

    /*
     * -------------------------------------------------------
     * ANSWER
     * -------------------------------------------------------
     */

    const handleAnswer =
      async (data: {
        senderSocketId: string;
        answer: RTCSessionDescriptionInit;
      }) => {
        console.log(
          "[WebRTC] answer from:",
          data.senderSocketId,
        );

        const peer =
          peerConnections.current[
            data.senderSocketId
          ];

        if (!peer) {
          console.warn(
            "[WebRTC] peer missing for answer:",
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
            "[WebRTC] handle answer failed:",
            error,
          );
        }
      };

    /*
     * -------------------------------------------------------
     * ICE
     * -------------------------------------------------------
     */

    const handleICECandidate =
      async (data: {
        senderSocketId: string;
        candidate: RTCIceCandidateInit;
      }) => {
        const peer =
          peerConnections.current[
            data.senderSocketId
          ];

        if (
          !peer ||
          !peer.remoteDescription
        ) {
          if (
            !pendingIceCandidates
              .current[
              data.senderSocketId
            ]
          ) {
            pendingIceCandidates
              .current[
              data.senderSocketId
            ] = [];
          }

          pendingIceCandidates
            .current[
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
            "[WebRTC] ICE error:",
            error,
          );
        }
      };

    /*
     * -------------------------------------------------------
     * MEETING ERROR
     * -------------------------------------------------------
     */

    const handleMeetingError =
      (data: {
        message: string;
      }) => {
        console.error(
          "[Meeting]",
          data.message,
        );
      };

    /*
     * -------------------------------------------------------
     * SOCKET CONNECT / RECONNECT
     * -------------------------------------------------------
     */

    const handleSocketConnect =
      () => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setLocalSocketId(
          socket.id ?? null,
        );

        console.log(
          "[Socket] connected:",
          socket.id,
        );

        /*
         * New socket ID means the server
         * considers this a new connection.
         *
         * Join again.
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

    /*
     * -------------------------------------------------------
     * REGISTER
     * -------------------------------------------------------
     */

    socket.on(
      "meeting:participants",
      handleParticipants,
    );

    socket.on(
      "meeting:existing-participants",
      handleExistingParticipants,
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

    socket.on(
      "connect",
      handleSocketConnect,
    );

    /*
     * -------------------------------------------------------
     * INITIAL JOIN
     * -------------------------------------------------------
     */

    if (
      !joinedRef.current
    ) {
      console.log(
        "[Meeting] joining:",
        meetingId,
        "tracks:",
        stream
          .getTracks()
          .map(
            (track) =>
              track.kind,
          ),
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
     * -------------------------------------------------------
     * CLEANUP
     * -------------------------------------------------------
     */

    return () => {
      mountedRef.current =
        false;

      socket.off(
        "meeting:participants",
        handleParticipants,
      );

      socket.off(
        "meeting:existing-participants",
        handleExistingParticipants,
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
       * Close local WebRTC connections.
       */
      Object.keys(
        peerConnections.current,
      ).forEach(
        (socketId) => {
          cleanupPeer(
            socketId,
          );
        },
      );
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
   * MIC / CAMERA STATE
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
      ).forEach(
        (socketId) => {
          cleanupPeer(
            socketId,
          );
        },
      );

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