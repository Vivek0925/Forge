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
  const [participants, setParticipants] = useState<
    MeetingParticipant[]
  >([]);

  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});

  const [localSocketId, setLocalSocketId] = useState<
    string | null
  >(socket.id ?? null);

  const streamRef = useRef<MediaStream | null>(stream);

  const peerConnections = useRef<
    Record<string, RTCPeerConnection>
  >({});

  const pendingIceCandidates = useRef<
    Record<string, RTCIceCandidateInit[]>
  >({});

  const joinedRef = useRef(false);
  const mountedRef = useRef(false);
  const reconnectingRef = useRef(false);

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

    Object.values(peerConnections.current).forEach(
      (peer) => {
        addLocalTracksToPeer(peer);
      },
    );
  }, [stream]);

  /*
   * =========================================================
   * CLEANUP PEER
   * =========================================================
   */

  const cleanupPeer = useCallback(
    (socketId: string) => {
      const peer =
        peerConnections.current[socketId];

      if (peer) {
        try {
          peer.ontrack = null;
          peer.onicecandidate = null;
          peer.onconnectionstatechange = null;
          peer.close();
        } catch {
          // Ignore.
        }

        delete peerConnections.current[socketId];
      }

      delete pendingIceCandidates.current[socketId];

      setRemoteStreams((previous) => {
        if (!previous[socketId]) {
          return previous;
        }

        const next = {
          ...previous,
        };

        delete next[socketId];

        return next;
      });
    },
    [],
  );

  /*
   * =========================================================
   * ADD LOCAL TRACKS
   * =========================================================
   */

  const addLocalTracksToPeer = useCallback(
    (peer: RTCPeerConnection) => {
      const localStream = streamRef.current;

      if (!localStream) {
        return;
      }

      const senders = peer.getSenders();

      localStream.getTracks().forEach((track) => {
        const alreadyAdded = senders.some(
          (sender) =>
            sender.track?.id === track.id,
        );

        if (alreadyAdded) {
          return;
        }

        peer.addTrack(track, localStream);
      });
    },
    [],
  );

  /*
   * =========================================================
   * CREATE PEER
   * =========================================================
   */

  const createPeerConnection = useCallback(
    (socketId: string) => {
      const existing =
        peerConnections.current[socketId];

      if (existing) {
        addLocalTracksToPeer(existing);
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

      addLocalTracksToPeer(peer);

      /*
       * REMOTE TRACK
       */

      peer.ontrack = (event) => {
        const remoteStream =
          event.streams[0];

        if (!remoteStream) {
          return;
        }

        console.log(
          "[WebRTC] remote stream received:",
          socketId,
          remoteStream
            .getTracks()
            .map(
              (track) =>
                `${track.kind}:${track.enabled}`,
            ),
        );

        setRemoteStreams((previous) => ({
          ...previous,
          [socketId]: remoteStream,
        }));
      };

      /*
       * ICE
       */

      peer.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        socket.emit(
          "webrtc:ice-candidate",
          {
            targetSocketId: socketId,
            candidate:
              event.candidate.toJSON(),
          },
        );
      };

      /*
       * CONNECTION STATE
       */

      peer.onconnectionstatechange = () => {
        console.log(
          `[WebRTC] ${socketId}: ${peer.connectionState}`,
        );

        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed" ||
          peer.connectionState ===
            "disconnected"
        ) {
          /*
           * Give disconnected peers a little
           * time before destroying them.
           *
           * This helps during temporary
           * browser/network changes.
           */
          if (
            peer.connectionState ===
            "disconnected"
          ) {
            setTimeout(() => {
              const current =
                peerConnections.current[
                  socketId
                ];

              if (
                current &&
                current.connectionState ===
                  "disconnected"
              ) {
                cleanupPeer(socketId);
              }
            }, 3000);

            return;
          }

          cleanupPeer(socketId);
        }
      };

      peerConnections.current[socketId] =
        peer;

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

  const flushIceCandidates = useCallback(
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
            new RTCIceCandidate(candidate),
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
   * NORMALIZE PARTICIPANTS
   * =========================================================
   *
   * VERY IMPORTANT.
   *
   * Socket ID identifies a connection.
   * User ID identifies the actual person.
   *
   * If a browser reconnects, socketId changes.
   * Therefore we deduplicate by userId.
   */

  const normalizeParticipants =
    useCallback(
      (
        incoming: MeetingParticipant[],
      ) => {
        const map =
          new Map<
            string,
            MeetingParticipant
          >();

        for (const participant of incoming) {
          /*
           * If duplicate user exists,
           * prefer the newest socket entry.
           */
          map.set(
            participant.userId,
            participant,
          );
        }

        return Array.from(map.values());
      },
      [],
    );

  /*
   * =========================================================
   * SOCKET EVENTS
   * =========================================================
   */

  useEffect(() => {
    if (!meetingId || !stream) {
      return;
    }

    mountedRef.current = true;

    /*
     * PARTICIPANTS
     */

    const handleParticipants = async (data: {
      participants: MeetingParticipant[];
    }) => {
      if (!mountedRef.current) {
        return;
      }

      const normalized =
        normalizeParticipants(
          data.participants,
        );

      console.log(
        "[Meeting] authoritative participants:",
        normalized,
      );

      setParticipants(normalized);

      /*
       * Remove WebRTC peers that no longer
       * exist in the authoritative list.
       */
      const validSocketIds =
        new Set(
          normalized.map(
            (participant) =>
              participant.socketId,
          ),
        );

      Object.keys(
        peerConnections.current,
      ).forEach((socketId) => {
        if (
          !validSocketIds.has(socketId)
        ) {
          cleanupPeer(socketId);
        }
      });

      /*
 * If this participant list arrived after
 * a socket reconnect, this browser is now
 * a NEW signaling peer.
 *
 * Create offers to the existing participants.
 *
 * We deliberately do this here instead of
 * changing the normal offer/answer flow.
 */
if (reconnectingRef.current) {
  reconnectingRef.current = false;

  for (const participant of normalized) {
    if (
      participant.socketId === socket.id
    ) {
      continue;
    }

    const peer =
      createPeerConnection(
        participant.socketId,
      );

    try {
      if (
        peer.signalingState !==
        "stable"
      ) {
        continue;
      }

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
        "[WebRTC] reconnect offer failed:",
        error,
      );
    }
  }
}
    };

    /*
     * EXISTING PARTICIPANTS
     */

    const handleExistingParticipants =
      (data: {
        participants: MeetingParticipant[];
      }) => {
        if (!mountedRef.current) {
          return;
        }

        setParticipants((previous) =>
          normalizeParticipants([
            ...previous,
            ...data.participants,
          ]),
        );
      };

    /*
     * PARTICIPANT JOINED
     */

    const handleParticipantJoined =
      async (data: {
        participant: MeetingParticipant;
      }) => {
        const participant =
          data.participant;

        /*
         * NEVER add our own user as a remote
         * participant.
         */
        if (
          participant.socketId ===
            socket.id
        ) {
          return;
        }

        setParticipants((previous) =>
          normalizeParticipants([
            ...previous.filter(
              (item) =>
                item.userId !==
                participant.userId,
            ),
            participant,
          ]),
        );

        /*
         * Existing participant creates offer.
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
      };

    /*
     * PARTICIPANT STATE
     */

    const handleParticipantState =
      (data: {
        participant: MeetingParticipant;
      }) => {
        const updated =
          data.participant;

        /*
         * Ignore state updates for ourselves.
         */
        if (
          updated.socketId ===
            socket.id
        ) {
          return;
        }

        setParticipants((previous) =>
          previous.map(
            (participant) =>
              participant.userId ===
              updated.userId
                ? {
                    ...participant,
                    socketId:
                      updated.socketId,
                    name: updated.name,
                    micEnabled:
                      updated.micEnabled,
                    cameraEnabled:
                      updated.cameraEnabled,
                  }
                : participant,
          ),
        );
      };

    /*
     * PARTICIPANT LEFT
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

        cleanupPeer(data.socketId);

        setParticipants((previous) =>
          previous.filter(
            (participant) =>
              participant.socketId !==
                data.socketId &&
              participant.userId !==
                data.userId,
          ),
        );
      };

    /*
     * MEETING ENDED
     */

    const handleMeetingEnded =
      (data: {
        meetingId: string;
      }) => {
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

        joinedRef.current = false;
      };

    /*
     * OFFER
     */

    const handleOffer = async (data: {
      senderSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      /*
       * Never accept an offer from ourselves.
       */
      if (
        data.senderSocketId ===
        socket.id
      ) {
        return;
      }

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
    };

    /*
     * ANSWER
     */

    const handleAnswer = async (data: {
      senderSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (!peer) {
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
    };

    /*
     * ICE
     */

    const handleICECandidate =
      async (data: {
        senderSocketId: string;
        candidate: RTCIceCandidateInit;
      }) => {
        if (
          data.senderSocketId ===
          socket.id
        ) {
          return;
        }

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
            pendingIceCandidates.current[
              data.senderSocketId
            ] = [];
          }

          pendingIceCandidates.current[
            data.senderSocketId
          ].push(data.candidate);

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
     * MEETING ERROR
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
     * SOCKET CONNECT
     */

    const handleSocketConnect = () => {
  if (!mountedRef.current) {
    return;
  }

  const newSocketId =
    socket.id ?? null;

  setLocalSocketId(newSocketId);

  console.log(
    "[Socket] connected:",
    newSocketId,
  );

  /*
   * If this is the first connection,
   * don't treat it as reconnect recovery.
   */
  const isReconnect =
    joinedRef.current;

  /*
   * The old socket ID is no longer valid
   * for WebRTC signaling.
   *
   * Clean old peer connections, but DO NOT
   * touch streamRef/current MediaStream.
   */
  Object.keys(
    peerConnections.current,
  ).forEach((socketId) => {
    cleanupPeer(socketId);
  });

  /*
   * Clear stale participant state.
   *
   * The server will send the authoritative
   * list after meeting:join.
   */
  setParticipants([]);

  /*
   * Tell handleParticipants that after the
   * fresh participant list arrives, this
   * socket needs to establish fresh peers.
   */
  reconnectingRef.current =
    isReconnect;

  joinedRef.current = false;

  socket.emit(
    "meeting:join",
    {
      meetingId,
    },
  );

  joinedRef.current = true;
};

    /*
     * REGISTER
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
     * INITIAL JOIN
     */

    if (!joinedRef.current) {
      console.log(
        "[Meeting] joining:",
        meetingId,
      );

      socket.emit("meeting:join", {
        meetingId,
      });

      joinedRef.current = true;
    }

    /*
     * CLEANUP
     */

    return () => {
      mountedRef.current = false;

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

      Object.keys(
        peerConnections.current,
      ).forEach((socketId) => {
        cleanupPeer(socketId);
      });
    };
  }, [
    meetingId,
    stream,
    createPeerConnection,
    cleanupPeer,
    flushIceCandidates,
    normalizeParticipants,
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

  const leaveMeeting = useCallback(() => {
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

    joinedRef.current = false;

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

  /*
 * =========================================================
 * DEVICE SWITCHING
 * =========================================================
 */

const switchCamera = useCallback(
  async (deviceId: string) => {
    const currentStream =
      streamRef.current;

    if (!currentStream) {
      return;
    }

    try {
      const newStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              deviceId: {
                exact: deviceId,
              },
            },
            audio: false,
          },
        );

      const newTrack =
        newStream.getVideoTracks()[0];

      if (!newTrack) {
        newStream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        return;
      }

      /*
       * Replace the camera track on every
       * existing peer connection.
       */
      for (const peer of Object.values(
        peerConnections.current,
      )) {
        const sender =
          peer
            .getSenders()
            .find(
              (item) =>
                item.track?.kind ===
                "video",
            );

        if (!sender) {
          continue;
        }

        await sender.replaceTrack(
          newTrack,
        );
      }

      /*
       * Replace the track in the local
       * MediaStream as well.
       */
      const oldTrack =
        currentStream.getVideoTracks()[0];

      if (oldTrack) {
        currentStream.removeTrack(
          oldTrack,
        );
        oldTrack.stop();
      }

      currentStream.addTrack(
        newTrack,
      );

      /*
       * Preserve the current camera
       * enabled/disabled state.
       */
      newTrack.enabled =
        oldTrack?.enabled ?? true;
    } catch (error) {
      console.error(
        "[Meeting] Failed to switch camera:",
        error,
      );
    }
  },
  [],
);

const switchMicrophone = useCallback(
  async (deviceId: string) => {
    const currentStream =
      streamRef.current;

    if (!currentStream) {
      return;
    }

    try {
      const newStream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: false,
            audio: {
              deviceId: {
                exact: deviceId,
              },
            },
          },
        );

      const newTrack =
        newStream.getAudioTracks()[0];

      if (!newTrack) {
        newStream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        return;
      }

      /*
       * Replace microphone track on every
       * existing peer connection.
       */
      for (const peer of Object.values(
        peerConnections.current,
      )) {
        const sender =
          peer
            .getSenders()
            .find(
              (item) =>
                item.track?.kind ===
                "audio",
            );

        if (!sender) {
          continue;
        }

        await sender.replaceTrack(
          newTrack,
        );
      }

      /*
       * Replace the microphone track in
       * the local MediaStream.
       */
      const oldTrack =
        currentStream.getAudioTracks()[0];

      if (oldTrack) {
        currentStream.removeTrack(
          oldTrack,
        );
        oldTrack.stop();
      }

      currentStream.addTrack(
        newTrack,
      );

      /*
       * Preserve mute state.
       */
      newTrack.enabled =
        oldTrack?.enabled ?? true;
    } catch (error) {
      console.error(
        "[Meeting] Failed to switch microphone:",
        error,
      );
    }
  },
  [],
);

  /*
 * =========================================================
 * SCREEN SHARING
 * =========================================================
 *
 * Replace the existing outgoing camera video
 * track without creating a new peer connection.
 */

const replaceVideoTrack = useCallback(
  async (track: MediaStreamTrack) => {
    const peers = Object.values(
      peerConnections.current,
    );

    for (const peer of peers) {
      const videoSender =
        peer
          .getSenders()
          .find(
            (sender) =>
              sender.track?.kind ===
              "video",
          );

      if (!videoSender) {
        continue;
      }

      try {
        await videoSender.replaceTrack(
          track,
        );
      } catch (error) {
        console.error(
          "[WebRTC] Failed to replace video track:",
          error,
        );
      }
    }
  },
  [],
);

  return {
    participants,
    remoteStreams,
    localSocketId,
    leaveMeeting,
    replaceVideoTrack,
    switchCamera,
    switchMicrophone,
  };
}