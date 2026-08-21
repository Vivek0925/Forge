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
   * Keep latest values available to
   * socket/WebRTC callbacks.
   */

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    micEnabledRef.current = micEnabled;
  }, [micEnabled]);

  useEffect(() => {
    cameraEnabledRef.current = cameraEnabled;
  }, [cameraEnabled]);

  /*
   * Create WebRTC peer connection.
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
     * Add local media tracks.
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
     * Remote media.
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
     * WebRTC connection state.
     *
     * IMPORTANT:
     *
     * Do NOT remove the participant here.
     *
     * A WebRTC connection can temporarily
     * become disconnected while the user
     * is still inside the meeting.
     */

    peer.onconnectionstatechange =
      () => {
        console.log(
          `[WebRTC] ${socketId} connection state:`,
          peer.connectionState,
        );

        if (
          peer.connectionState ===
          "failed"
        ) {
          cleanupPeer(socketId);
        }

        if (
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

  /*
   * Clean up ONLY WebRTC state.
   *
   * Do NOT remove the participant.
   */

  function cleanupPeer(
    socketId: string,
  ) {
    const peer =
      peerConnections.current[
        socketId
      ];

    if (peer) {
      try {
        peer.close();
      } catch {
        // Ignore already-closed peer.
      }

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
  }

  /*
   * Remove a participant from the UI.
   *
   * This should ONLY happen when the
   * server explicitly says they left.
   */

  function removeParticipant(
    socketId: string,
  ) {
    cleanupPeer(socketId);

    setParticipants((prev) =>
      prev.filter(
        (participant) =>
          participant.socketId !==
          socketId,
      ),
    );
  }

  /*
   * Meeting socket listeners.
   */

  useEffect(() => {
    if (!meetingId) {
      return;
    }

    if (joinedRef.current) {
      return;
    }

    joinedRef.current = true;

    /*
     * COMPLETE participant list.
     *
     * This is the authoritative meeting
     * participant state.
     */

    function handleParticipants(data: {
      participants: MeetingParticipant[];
    }) {
      setParticipants(
        data.participants,
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
       * Add participant if they aren't
       * already present.
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
     * Participant mic/camera state.
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
     * Participant actually left.
     */

    function handleParticipantLeft(
      data: {
        socketId: string;
        userId: string;
      },
    ) {
      removeParticipant(
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
        try {
          peer.close();
        } catch {
          // Ignore.
        }
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
     * Join meeting.
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
        try {
          peer.close();
        } catch {
          // Ignore.
        }
      });

      peerConnections.current = {};

      setRemoteStreams({});
      setParticipants([]);
    };
  }, [meetingId]);

  /*
   * Broadcast local mic/camera state.
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

  return {
    participants,
    remoteStreams,
  };
}