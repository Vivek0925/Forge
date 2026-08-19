"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "@/lib/socket";

export interface MeetingParticipant {
  socketId: string;
  userId: string;
  name: string;
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
    useState<MeetingParticipant[]>([]);

  const [remoteStreams, setRemoteStreams] =
    useState<Record<string, MediaStream>>({});

  const peerConnections =
    useRef<Record<string, RTCPeerConnection>>({});

  const streamRef =
    useRef<MediaStream | null>(stream);

  useEffect(() => {
    streamRef.current = stream;

    /*
     * If a stream becomes available after a
     * peer connection was already created,
     * add the tracks to that connection.
     */
    if (!stream) {
      return;
    }

    Object.values(peerConnections.current).forEach(
      (peer) => {
        const existingSenders =
          peer.getSenders();

        stream.getTracks().forEach((track) => {
          const alreadyAdded =
            existingSenders.some(
              (sender) =>
                sender.track?.kind === track.kind,
            );

          if (!alreadyAdded) {
            peer.addTrack(track, stream);
          }
        });
      },
    );
  }, [stream]);

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
     * Add local camera + microphone.
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
     * Remote camera + microphone.
     */
    peer.ontrack = (event) => {
      const remoteStream =
        event.streams[0];

      if (!remoteStream) {
        return;
      }

      console.log(
        "Received remote stream:",
        socketId,
      );

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

    peer.onconnectionstatechange =
      () => {
        console.log(
          `WebRTC connection ${socketId}:`,
          peer.connectionState,
        );

        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed"
        ) {
          cleanupPeer(socketId);
        }
      };

    peerConnections.current[
      socketId
    ] = peer;

    return peer;
  }

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

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    /*
     * Existing participants when we join.
     */
    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      console.log(
        "Existing meeting participants:",
        data.participants,
      );

      setParticipants(
        data.participants,
      );
    }

    /*
     * Someone else joined.
     *
     * We are already inside the meeting,
     * so we create the offer.
     */
    async function handleParticipantJoined(
      data: {
        participant: MeetingParticipant;
      },
    ) {
      const participant =
        data.participant;

      console.log(
        "Participant joined:",
        participant,
      );

      setParticipants((prev) => {
        const exists = prev.some(
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
          "Failed to create WebRTC offer:",
          error,
        );
      }
    }

    /*
     * We receive an offer from an
     * existing participant.
     */
    async function handleOffer(data: {
      senderSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) {
      console.log(
        "Received WebRTC offer from:",
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
          "Failed to handle WebRTC offer:",
          error,
        );
      }
    }

    /*
     * We receive an answer to our offer.
     */
    async function handleAnswer(data: {
      senderSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) {
      console.log(
        "Received WebRTC answer from:",
        data.senderSocketId,
      );

      const peer =
        peerConnections.current[
          data.senderSocketId
        ];

      if (!peer) {
        console.warn(
          "No peer connection for answer:",
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
      } catch (error) {
        console.error(
          "Failed to set remote answer:",
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
        console.warn(
          "No peer connection for ICE candidate:",
          data.senderSocketId,
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
          "Failed to add ICE candidate:",
          error,
        );
      }
    }

    /*
     * Someone left.
     */
    function handleParticipantLeft(data: {
      socketId: string;
      userId: string;
    }) {
      console.log(
        "Participant left:",
        data.socketId,
      );

      cleanupPeer(
        data.socketId,
      );
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

    /*
     * Join meeting.
     */
    socket.emit("meeting:join", {
      meetingId,
    });

    return () => {
      socket.emit("meeting:leave", {
        meetingId,
      });

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
      ).forEach((peer) => {
        peer.close();
      });

      peerConnections.current = {};

      setRemoteStreams({});
      setParticipants([]);
    };
  }, [meetingId]);

  return {
    participants,
    remoteStreams,
  };
}