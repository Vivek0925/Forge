"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "@/lib/socket";

interface Participant {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string | null;
}

interface UseMeetingOptions {
  meetingId: string;
  stream: MediaStream | null;
}

export function useMeeting({
  meetingId,
  stream,
}: UseMeetingOptions) {
  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [remoteStreams, setRemoteStreams] =
    useState<
      Record<string, MediaStream>
    >({});

  const peerConnections =
    useRef<
      Record<
        string,
        RTCPeerConnection
      >
    >({});

  const streamRef =
    useRef<MediaStream | null>(
      stream,
    );

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  const createPeerConnection = (
    socketId: string,
  ) => {
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
     * Add our camera + microphone.
     */
    streamRef.current
      ?.getTracks()
      .forEach((track) => {
        peer.addTrack(
          track,
          streamRef.current!,
        );
      });

    /*
     * Receive remote camera/audio.
     */
    peer.ontrack = (event) => {
      const [remoteStream] =
        event.streams;

      if (!remoteStream) {
        return;
      }

      setRemoteStreams(
        (prev) => ({
          ...prev,
          [socketId]:
            remoteStream,
        }),
      );
    };

    /*
     * ICE candidates.
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
          targetSocketId: socketId,
          candidate:
            event.candidate.toJSON(),
        },
      );
    };

    peerConnections.current[
      socketId
    ] = peer;

    return peer;
  };

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    function handleParticipants(data: {
      participants: Participant[];
    }) {
      setParticipants(
        data.participants,
      );
    }

    async function handleParticipantJoined(
      data: {
        participant: Participant;
      },
    ) {
      const socketId =
        data.participant.socketId;

      setParticipants((prev) => {
        const exists = prev.some(
          (p) =>
            p.socketId === socketId,
        );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          data.participant,
        ];
      });

      /*
       * Existing users create the offer.
       */
      const peer =
        createPeerConnection(
          socketId,
        );

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer,
      );

      socket.emit(
        "webrtc:offer",
        {
          targetSocketId: socketId,
          offer,
        },
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
    }

    async function handleAnswer(
      data: {
        senderSocketId: string;
        answer: RTCSessionDescriptionInit;
      },
    ) {
      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (!peer) {
        return;
      }

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          data.answer,
        ),
      );
    }

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
          "Failed to add ICE candidate",
          error,
        );
      }
    }

    function handleParticipantLeft(
      data: {
        socketId: string;
        userId: string;
      },
    ) {
      const peer =
        peerConnections.current[
          data.socketId
        ];

      if (peer) {
        peer.close();

        delete peerConnections.current[
          data.socketId
        ];
      }

      setParticipants(
        (prev) =>
          prev.filter(
            (participant) =>
              participant.socketId !==
              data.socketId,
          ),
      );

      setRemoteStreams(
        (prev) => {
          const next = {
            ...prev,
          };

          delete next[
            data.socketId
          ];

          return next;
        },
      );
    }

    function handleMeetingError(
      data: {
        message: string;
      },
    ) {
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
      "meeting:participant-left",
      handleParticipantLeft,
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
        "meeting:participant-left",
        handleParticipantLeft,
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
      ).forEach((peer) =>
        peer.close(),
      );

      peerConnections.current = {};
    };
  }, [meetingId]);

  return {
    participants,
    remoteStreams,
  };
}