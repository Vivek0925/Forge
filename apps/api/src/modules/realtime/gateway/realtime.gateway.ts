import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Logger } from "@nestjs/common";
import { Server } from "socket.io";

import { PresenceService } from "../services/presence.service";
import { SocketAuthService } from "../services/socket-auth.service";
import type { AuthenticatedSocket } from "../interfaces/authenticated-socket.interface";

import { JoinWorkspaceDto } from "../dto/join-workspace.dto";

import { PrismaService } from "../../../database/prisma.service";

import { ChatService } from "../../chat/services/chat.service";
import { SendMessageDto } from "../../chat/dto/send-message.dto";

import { MeetingRoomService } from "../../meeting/services/meeting-room.service";

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger =
    new Logger(RealtimeGateway.name);

  constructor(
    private readonly socketAuthService: SocketAuthService,
    private readonly presenceService: PresenceService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly meetingRoomService: MeetingRoomService,
  ) {}

  // =========================================================
  // SOCKET CONNECTION
  // =========================================================

  async handleConnection(
    socket: AuthenticatedSocket,
  ) {
    try {
      const currentUser =
        await this.socketAuthService.authenticate(
          socket,
        );

      socket.data.currentUser =
        currentUser;

      this.logger.log(
        `${currentUser.name} connected (${socket.id})`,
      );
    } catch (error) {
      this.logger.warn(
        `Unauthorized socket connection: ${socket.id}`,
      );

      socket.disconnect(true);
    }
  }

  // =========================================================
  // SOCKET DISCONNECT
  // =========================================================

  handleDisconnect(
    socket: AuthenticatedSocket,
  ) {
    /*
     * IMPORTANT:
     *
     * Browser refresh/tab close causes socket
     * disconnect.
     *
     * Therefore meeting cleanup MUST happen
     * here as well as in meeting:leave.
     */

    const meetingId =
      this.meetingRoomService.getMeetingForSocket(
        socket.id,
      );

    if (meetingId) {
      this.removeMeetingParticipant(
        meetingId,
        socket,
      );
    }

    /*
     * Existing workspace presence cleanup.
     */

    const onlineUser =
      this.presenceService.getUser(
        socket.id,
      );

    if (!onlineUser) {
      return;
    }

    this.presenceService.removeUser(
      socket.id,
    );

    this.server
      .to(
        `workspace:${onlineUser.workspaceId}`,
      )
      .emit("presence:update", {
        users:
          this.presenceService.getWorkspaceUsers(
            onlineUser.workspaceId,
          ),
      });

    this.logger.log(
      `${onlineUser.name} disconnected`,
    );
  }

  // =========================================================
  // WORKSPACE JOIN
  // =========================================================

  @SubscribeMessage("workspace:join")
  async handleWorkspaceJoin(
    @MessageBody()
    dto: JoinWorkspaceDto,

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const workspace =
      await this.prisma.workspace.findUnique({
        where: {
          slug: dto.workspaceSlug,
        },
      });

    if (!workspace) {
      this.logger.warn(
        `Workspace not found: ${dto.workspaceSlug}`,
      );

      return;
    }

    socket.join(
      `workspace:${workspace.id}`,
    );

    this.presenceService.addUser({
      socketId: socket.id,
      workspaceId: workspace.id,
      userId: socket.data.currentUser.id,
      name: socket.data.currentUser.name,
      email: socket.data.currentUser.email,
    });

    this.server
      .to(
        `workspace:${workspace.id}`,
      )
      .emit("presence:update", {
        users:
          this.presenceService.getWorkspaceUsers(
            workspace.id,
          ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} joined workspace ${workspace.slug}`,
    );
  }

  // =========================================================
  // WORKSPACE LEAVE
  // =========================================================

  @SubscribeMessage("workspace:leave")
  async handleWorkspaceLeave(
    @MessageBody()
    dto: JoinWorkspaceDto,

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const workspace =
      await this.prisma.workspace.findUnique({
        where: {
          slug: dto.workspaceSlug,
        },
      });

    if (!workspace) {
      return;
    }

    socket.leave(
      `workspace:${workspace.id}`,
    );

    this.presenceService.removeUser(
      socket.id,
    );

    this.server
      .to(
        `workspace:${workspace.id}`,
      )
      .emit("presence:update", {
        users:
          this.presenceService.getWorkspaceUsers(
            workspace.id,
          ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} left workspace ${workspace.slug}`,
    );
  }

  // =========================================================
  // CHAT
  // =========================================================

  @SubscribeMessage("chat:send")
  async handleChatSend(
    @MessageBody()
    dto: SendMessageDto,

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const message =
      await this.chatService.createMessage(
        socket.data.currentUser.id,
        dto,
      );

    this.server
      .to(
        `workspace:${message.workspaceId}`,
      )
      .emit("chat:new", message);

    return message;
  }

  // =========================================================
  // MEETING JOIN
  // =========================================================

  @SubscribeMessage("meeting:join")
  async handleMeetingJoin(
    @MessageBody()
    data: {
      meetingId: string;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: data.meetingId,
        },
      });

    if (!meeting) {
      socket.emit("meeting:error", {
        message: "Meeting not found",
      });

      return;
    }

    if (
      meeting.status === "ENDED" ||
      meeting.status === "CANCELLED"
    ) {
      socket.emit("meeting:error", {
        message:
          "This meeting is no longer active",
      });

      return;
    }

    /*
     * If this socket was previously in
     * another meeting, clean it up first.
     */

    const previousMeeting =
      this.meetingRoomService.getMeetingForSocket(
        socket.id,
      );

    if (
      previousMeeting &&
      previousMeeting !==
        data.meetingId
    ) {
      this.removeMeetingParticipant(
        previousMeeting,
        socket,
      );
    }

    /*
     * Prevent duplicate joins.
     */

    if (
      this.meetingRoomService.hasParticipant(
        data.meetingId,
        socket.id,
      )
    ) {
      const participants =
        this.meetingRoomService.getParticipants(
          data.meetingId,
        );

      socket.emit(
        "meeting:participants",
        {
          participants,
        },
      );

      return;
    }

    /*
     * Scheduled -> ACTIVE.
     */

    if (
      meeting.status ===
      "SCHEDULED"
    ) {
      const startedAt =
        new Date();

      await this.prisma.meeting.update({
        where: {
          id: meeting.id,
        },

        data: {
          status: "ACTIVE",
          startedAt,
        },
      });

      this.server
        .to(
          `workspace:${meeting.workspaceId}`,
        )
        .emit("meeting:status", {
          meetingId: meeting.id,
          status: "ACTIVE",
          startedAt:
            startedAt.toISOString(),
        });
    }

    const currentUser =
      socket.data.currentUser;

    /*
     * Get existing participants BEFORE
     * adding this socket.
     *
     * Existing users need this information
     * for WebRTC negotiation.
     */

    const existingParticipants =
      this.meetingRoomService.getParticipants(
        data.meetingId,
      );

    /*
     * Add participant to authoritative
     * server-side room.
     */

    this.meetingRoomService.join(
      data.meetingId,
      {
        socketId: socket.id,
        userId: currentUser.id,
        name: currentUser.name,

        /*
         * Initial media state.
         *
         * The frontend should start its
         * camera/mic with these values.
         */
        micEnabled: true,
        cameraEnabled: true,
      },
    );

    /*
     * Join Socket.IO room.
     */

    socket.join(
      `meeting:${data.meetingId}`,
    );

    /*
     * Get authoritative list AFTER
     * adding the new participant.
     */

    const allParticipants =
      this.meetingRoomService.getParticipants(
        data.meetingId,
      );

    /*
     * IMPORTANT:
     *
     * Broadcast the COMPLETE list to
     * EVERYONE in the meeting.
     *
     * A -> [A]
     *
     * B joins -> both A and B receive
     * [A,B].
     */

    this.server
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:participants",
        {
          participants:
            allParticipants,
        },
      );

    /*
     * Tell existing participants that
     * a new WebRTC peer has arrived.
     *
     * Existing participant creates offer.
     */

    socket
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:participant-joined",
        {
          participant: {
            socketId: socket.id,
            userId:
              currentUser.id,
            name:
              currentUser.name,
            micEnabled: true,
            cameraEnabled: true,
          },
        },
      );

    /*
     * Tell newcomer exactly who was
     * already there.
     *
     * This is separate from the complete
     * participant list and makes initial
     * WebRTC setup deterministic.
     */

    socket.emit(
      "meeting:existing-participants",
      {
        participants:
          existingParticipants,
      },
    );

    this.logger.log(
      `${currentUser.name} joined meeting ${data.meetingId} (${socket.id})`,
    );
  }

  // =========================================================
  // MEETING LEAVE
  // =========================================================

  @SubscribeMessage("meeting:leave")
  handleMeetingLeave(
    @MessageBody()
    data: {
      meetingId: string;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    this.removeMeetingParticipant(
      data.meetingId,
      socket,
    );
  }

  // =========================================================
  // PARTICIPANT STATE
  // =========================================================

  @SubscribeMessage(
    "meeting:participant-state",
  )
  handleMeetingParticipantState(
    @MessageBody()
    data: {
      meetingId: string;
      micEnabled?: boolean;
      cameraEnabled?: boolean;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    /*
     * Only update state if this socket is
     * actually inside this meeting.
     */

    const currentParticipant =
      this.meetingRoomService.getParticipant(
        data.meetingId,
        socket.id,
      );

    if (!currentParticipant) {
      return;
    }

    const updatedParticipant =
      this.meetingRoomService.updateParticipantState(
        data.meetingId,
        socket.id,
        {
          micEnabled:
            data.micEnabled,
          cameraEnabled:
            data.cameraEnabled,
        },
      );

    if (!updatedParticipant) {
      return;
    }

    /*
     * Broadcast to EVERYONE.
     *
     * Do NOT use socket.to() here.
     *
     * The sender also needs the authoritative
     * state update.
     */

    this.server
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:participant-state",
        {
          participant:
            updatedParticipant,
        },
      );

    this.logger.debug(
      `Participant state updated: ${updatedParticipant.name} | mic=${updatedParticipant.micEnabled} camera=${updatedParticipant.cameraEnabled}`,
    );
  }

  // =========================================================
  // MEETING END
  // =========================================================

  @SubscribeMessage("meeting:end")
  async handleMeetingEnd(
    @MessageBody()
    data: {
      meetingId: string;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: data.meetingId,
        },
      });

    if (!meeting) {
      return;
    }

    const endedAt =
      new Date();

    await this.prisma.meeting.update({
      where: {
        id: data.meetingId,
      },

      data: {
        status: "ENDED",
        endedAt,
      },
    });

    /*
     * Tell everyone that the meeting ended.
     */

    this.server
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit("meeting:ended", {
        meetingId:
          data.meetingId,
        endedAt:
          endedAt.toISOString(),
      });

    /*
     * Clear server-side room.
     */

    this.meetingRoomService.clearMeeting(
      data.meetingId,
    );

    this.logger.log(
      `Meeting ended: ${data.meetingId} by ${socket.data.currentUser.name}`,
    );
  }

  // =========================================================
  // WEBRTC OFFER
  // =========================================================

  @SubscribeMessage("webrtc:offer")
  handleWebRTCOffer(
    @MessageBody()
    data: {
      targetSocketId: string;
      offer: RTCSessionDescriptionInit;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    /*
     * Forward offer directly to the target.
     *
     * Don't broadcast it to the entire
     * meeting.
     */

    this.server
      .to(data.targetSocketId)
      .emit("webrtc:offer", {
        senderSocketId:
          socket.id,
        offer: data.offer,
      });
  }

  // =========================================================
  // WEBRTC ANSWER
  // =========================================================

  @SubscribeMessage("webrtc:answer")
  handleWebRTCAnswer(
    @MessageBody()
    data: {
      targetSocketId: string;
      answer: RTCSessionDescriptionInit;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    this.server
      .to(data.targetSocketId)
      .emit("webrtc:answer", {
        senderSocketId:
          socket.id,
        answer: data.answer,
      });
  }

  // =========================================================
  // WEBRTC ICE
  // =========================================================

  @SubscribeMessage(
    "webrtc:ice-candidate",
  )
  handleWebRTCIceCandidate(
    @MessageBody()
    data: {
      targetSocketId: string;
      candidate: RTCIceCandidateInit;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    this.server
      .to(data.targetSocketId)
      .emit(
        "webrtc:ice-candidate",
        {
          senderSocketId:
            socket.id,
          candidate:
            data.candidate,
        },
      );
  }

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

  private removeMeetingParticipant(
    meetingId: string,
    socket: AuthenticatedSocket,
  ) {
    const participant =
      this.meetingRoomService.getParticipant(
        meetingId,
        socket.id,
      );

    /*
     * Already removed.
     *
     * This can happen when both:
     *
     * meeting:leave
     *
     * and
     *
     * disconnect
     *
     * happen around the same time.
     */

    if (!participant) {
      return;
    }

    /*
     * Remove from server-side room.
     */

    const participants =
      this.meetingRoomService.leave(
        meetingId,
        socket.id,
      );

    /*
     * Remove from Socket.IO room.
     */

    socket.leave(
      `meeting:${meetingId}`,
    );

    /*
     * Tell everyone else that this exact
     * socket left.
     */

    this.server
      .to(
        `meeting:${meetingId}`,
      )
      .emit(
        "meeting:participant-left",
        {
          socketId:
            socket.id,
          userId:
            participant.userId,
        },
      );

    /*
     * Then send authoritative complete
     * participant list.
     */

    this.server
      .to(
        `meeting:${meetingId}`,
      )
      .emit(
        "meeting:participants",
        {
          participants,
        },
      );

    this.logger.log(
      `${participant.name} left meeting ${meetingId} (${socket.id})`,
    );
  }
}