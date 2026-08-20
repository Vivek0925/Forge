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

  const peerConnections =
    useRef<Record<string, RTCPeerConnection>>({});

  const streamRef =
    useRef<MediaStream | null>(stream);

  /*
   * Keep latest stream available to WebRTC callbacks.
   */
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  /*
   * Create peer connection.
   */
  function createPeerConnection(socketId: string) {
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
     * Receive remote stream.
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

    peer.onconnectionstatechange = () => {
      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed" ||
        peer.connectionState === "disconnected"
      ) {
        cleanupPeer(socketId);
      }
    };

    peerConnections.current[socketId] =
      peer;

    return peer;
  }

  /*
   * Cleanup peer.
   */
  function cleanupPeer(socketId: string) {
    const peer =
      peerConnections.current[socketId];

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
   * Join meeting + WebRTC listeners.
   */
  useEffect(() => {
    if (!meetingId) {
      return;
    }

    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      setParticipants(
        data.participants,
      );

      /*
       * IMPORTANT:
       * Send our current state AFTER
       * the server has registered us.
       */
      socket.emit(
        "meeting:participant-state",
        {
          meetingId,
          micEnabled,
          cameraEnabled,
        },
      );
    }

    async function handleParticipantJoined(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      const participant =
        data.participant;

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
          "Failed to create offer:",
          error,
        );
      }
    }

    function handleParticipantState(data: {
      participant: MeetingParticipant;
    }) {
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.socketId ===
          data.participant.socketId
            ? data.participant
            : participant,
        ),
      );
    }

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

    async function handleICECandidate(data: {
      senderSocketId: string;
      candidate: RTCIceCandidateInit;
    }) {
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

    function handleParticipantLeft(data: {
      socketId: string;
      userId: string;
    }) {
      cleanupPeer(
        data.socketId,
      );
    }

    function handleMeetingEnded(data: {
      meetingId: string;
      endedAt: string;
    }) {
      if (
        data.meetingId !== meetingId
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

    function handleMeetingError(data: {
      message: string;
    }) {
      console.error(
        "Meeting error:",
        data.message,
      );
    }

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
     * JOIN FIRST.
     */
    socket.emit(
      "meeting:join",
      {
        meetingId,
      },
    );

    return () => {
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
   * Send state whenever local
   * mic/camera changes.
   */
  useEffect(() => {
    if (!meetingId) {
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

  return {
    participants,
    remoteStreams,
  };
}