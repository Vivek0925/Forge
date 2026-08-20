"use client";

import {
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

  /*
   * Keep the latest values available to
   * socket/WebRTC callbacks.
   */
  const streamRef =
    useRef<MediaStream | null>(stream);

  const micEnabledRef =
    useRef(micEnabled);

  const cameraEnabledRef =
    useRef(cameraEnabled);

  const peerConnections =
    useRef<Record<string, RTCPeerConnection>>({});

  const joinedRef =
    useRef(false);

  /*
   * Keep refs synchronized.
   */

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
   * Create peer connection.
   */

  function createPeerConnection(
    socketId: string,
  ) {
    const existing =
      peerConnections.current[socketId];

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

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            streamRef.current!,
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

      setRemoteStreams((prev) => ({
        ...prev,
        [socketId]: remoteStream,
      }));
    };

    /*
     * ICE candidates.
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
     * Connection state.
     */

    peer.onconnectionstatechange =
      () => {
        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed" ||
          peer.connectionState ===
            "disconnected"
        ) {
          cleanupPeer(socketId);
        }
      };

    peerConnections.current[
      socketId
    ] = peer;

    return peer;
  }

  /*
   * Cleanup a single participant.
   */

  function cleanupPeer(
    socketId: string,
  ) {
    const peer =
      peerConnections.current[
        socketId
      ];

    if (peer) {
      peer.close();

      delete peerConnections.current[
        socketId
      ];
    }

    setRemoteStreams((prev) => {
      const next = {
        ...prev,
      };

      delete next[socketId];

      return next;
    });

    setParticipants((prev) =>
      prev.filter(
        (participant) =>
          participant.socketId !==
          socketId,
      ),
    );
  }

  /*
   * Join meeting and register
   * all socket/WebRTC listeners.
   */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    /*
     * Prevent duplicate joins.
     */

    if (joinedRef.current) {
      return;
    }

    joinedRef.current = true;

    /*
     * Server sends the complete
     * participant list.
     */

    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      setParticipants(
        data.participants,
      );

      /*
       * IMPORTANT:
       *
       * Do NOT use captured micEnabled /
       * cameraEnabled here.
       *
       * Use refs containing the latest
       * state.
       */

      socket.emit(
        "meeting:participant-state",
        {
          meetingId,
          micEnabled:
            micEnabledRef.current,
          cameraEnabled:
            cameraEnabledRef.current,
        },
      );
    }

    /*
     * A new participant joined.
     */

    async function handleParticipantJoined(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      const participant =
        data.participant;

      /*
       * Add participant if not already
       * present.
       */

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
       * Create WebRTC connection.
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
          "Failed to create offer:",
          error,
        );
      }
    }

    /*
     * Participant changed mic/camera.
     */

    function handleParticipantState(data: {
      participant: MeetingParticipant;
    }) {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId ===
          data.participant.socketId
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
     * WebRTC offer.
     */

    async function handleOffer(data: {
      senderSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) {
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
          "Failed to handle offer:",
          error,
        );
      }
    }

    /*
     * WebRTC answer.
     */

    async function handleAnswer(data: {
      senderSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) {
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
      } catch (error) {
        console.error(
          "Failed to set answer:",
          error,
        );
      }
    }

    /*
     * ICE candidate.
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

      if (!peer) {
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
          "Failed to add ICE candidate:",
          error,
        );
      }
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
      cleanupPeer(
        data.socketId,
      );
    }

    /*
     * Meeting ended.
     */

    function handleMeetingEnded(data: {
      meetingId: string;
      endedAt: string;
    }) {
      if (
        data.meetingId !==
        meetingId
      ) {
        return;
      }

      Object.values(
        peerConnections.current,
      ).forEach((peer) => {
        peer.close();
      });

      peerConnections.current = {};

      setRemoteStreams({});
      setParticipants([]);
    }

    /*
     * Meeting error.
     */

    function handleMeetingError(data: {
      message: string;
    }) {
      console.error(
        "Meeting error:",
        data.message,
      );
    }

    /*
     * Register listeners.
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
      "meeting:error",
      handleMeetingError,
    );

    /*
     * JOIN.
     */

    socket.emit(
      "meeting:join",
      {
        meetingId,
      },
    );

    /*
     * Cleanup.
     */

    return () => {
      joinedRef.current = false;

      socket.emit(
        "meeting:leave",
        {
          meetingId,
        },
      );

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
        "meeting:error",
        handleMeetingError,
      );

      Object.values(
        peerConnections.current,
      ).forEach((peer) => {
        peer.close();
      });

      peerConnections.current = {};

      setRemoteStreams({});
      setParticipants([]);
    };
  }, [meetingId]);

  /*
   * Broadcast local mic/camera state.
   *
   * This runs whenever the user clicks
   * mute/unmute or camera on/off.
   */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    if (!joinedRef.current) {
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
   * Return meeting state.
   */

  return {
    participants,
    remoteStreams,
  };
}