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
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger =
    new Logger(
      RealtimeGateway.name,
    );

  constructor(
    private readonly socketAuthService: SocketAuthService,
    private readonly presenceService: PresenceService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
    private readonly meetingRoomService: MeetingRoomService,
  ) {}

  // =========================================================
  // CONNECTION
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
    } catch {
      this.logger.warn(
        `Unauthorized socket connection: ${socket.id}`,
      );

      socket.disconnect(true);
    }
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  async handleDisconnect(
    socket: AuthenticatedSocket,
  ) {
    const meetingId =
      this.meetingRoomService.getMeetingForSocket(
        socket.id,
      );

    if (meetingId) {
      await this.removeMeetingParticipant(
        meetingId,
        socket,
      );
    }

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
      return;
    }

    socket.join(
      `workspace:${workspace.id}`,
    );

    this.presenceService.addUser({
      socketId: socket.id,
      workspaceId: workspace.id,
      userId:
        socket.data.currentUser.id,
      name:
        socket.data.currentUser.name,
      email:
        socket.data.currentUser.email,
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
      .emit(
        "chat:new",
        message,
      );

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
      socket.emit(
        "meeting:error",
        {
          message:
            "Meeting not found",
        },
      );

      return;
    }

    if (
      meeting.status === "ENDED" ||
      meeting.status === "CANCELLED"
    ) {
      socket.emit(
        "meeting:error",
        {
          message:
            "This meeting is no longer active",
        },
      );

      return;
    }

    /*
     * Start scheduled meeting when
     * first participant joins.
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
        .emit(
          "meeting:status",
          {
            meetingId:
              meeting.id,
            status: "ACTIVE",
            startedAt:
              startedAt.toISOString(),
          },
        );
    }

    const currentUser =
      socket.data.currentUser;

    const alreadyJoined =
      this.meetingRoomService.hasParticipant(
        data.meetingId,
        socket.id,
      );

    /*
     * Add participant only once.
     */

    if (!alreadyJoined) {
      this.meetingRoomService.join(
        data.meetingId,
        {
          socketId: socket.id,
          userId: currentUser.id,
          name: currentUser.name,
          micEnabled: true,
          cameraEnabled: true,
        },
      );
    }

    /*
     * Join Socket.IO room FIRST.
     */

    socket.join(
      `meeting:${data.meetingId}`,
    );

    const participants =
      this.meetingRoomService.getParticipants(
        data.meetingId,
      );

    /*
     * Authoritative participant state.
     */

    this.server
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:participants",
        {
          participants,
        },
      );

    /*
     * Only notify existing participants
     * when this is a genuinely new join.
     */

    if (!alreadyJoined) {
      socket
        .to(
          `meeting:${data.meetingId}`,
        )
        .emit(
          "meeting:participant-joined",
          {
            participant: {
              socketId:
                socket.id,
              userId:
                currentUser.id,
              name:
                currentUser.name,
              micEnabled: true,
              cameraEnabled:
                true,
            },
          },
        );
    }

    this.logger.log(
      `${currentUser.name} joined meeting ${data.meetingId} (${socket.id})`,
    );
  }

  // =========================================================
  // MEETING LEAVE
  // =========================================================

  @SubscribeMessage("meeting:leave")
  async handleMeetingLeave(
    @MessageBody()
    data: {
      meetingId: string;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    await this.removeMeetingParticipant(
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
  handleParticipantState(
    @MessageBody()
    data: {
      meetingId: string;
      micEnabled?: boolean;
      cameraEnabled?: boolean;
    },

    @ConnectedSocket()
    socket: AuthenticatedSocket,
  ) {
    const participant =
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

    if (!participant) {
      return;
    }

    socket
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:participant-state",
        {
          participant,
        },
      );
  }

  // =========================================================
  // REMOVE PARTICIPANT
  // =========================================================

  private async removeMeetingParticipant(
    meetingId: string,
    socket: AuthenticatedSocket,
  ) {
    const participant =
      this.meetingRoomService.getParticipant(
        meetingId,
        socket.id,
      );

    if (!participant) {
      socket.leave(
        `meeting:${meetingId}`,
      );

      return;
    }

    const participants =
      this.meetingRoomService.leave(
        meetingId,
        socket.id,
      );

    socket.leave(
      `meeting:${meetingId}`,
    );

    /*
     * Notify remaining users.
     */

    this.server
      .to(
        `meeting:${meetingId}`,
      )
      .emit(
        "meeting:participant-left",
        {
          socketId: socket.id,
          userId:
            participant.userId,
        },
      );

    /*
     * Send authoritative list.
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
      `${participant.name} left meeting ${meetingId}`,
    );
  }

  // =========================================================
  // END MEETING
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
      socket.emit(
        "meeting:error",
        {
          message:
            "Meeting not found",
        },
      );

      return;
    }

    if (
      meeting.createdById !==
      socket.data.currentUser.id
    ) {
      socket.emit(
        "meeting:error",
        {
          message:
            "Only the meeting host can end the meeting",
        },
      );

      return;
    }

    if (
      meeting.status === "ENDED" ||
      meeting.status === "CANCELLED"
    ) {
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

    this.server
      .to(
        `meeting:${data.meetingId}`,
      )
      .emit(
        "meeting:ended",
        {
          meetingId:
            data.meetingId,
          endedAt:
            endedAt.toISOString(),
        },
      );

    const participants =
      this.meetingRoomService.getParticipants(
        data.meetingId,
      );

    for (const participant of participants) {
      const participantSocket =
        this.server.sockets.sockets.get(
          participant.socketId,
        );

      if (participantSocket) {
        participantSocket.leave(
          `meeting:${data.meetingId}`,
        );
      }
    }

    this.meetingRoomService.clearMeeting(
      data.meetingId,
    );

    this.logger.log(
      `${socket.data.currentUser.name} ended meeting ${data.meetingId}`,
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
    this.server
      .to(data.targetSocketId)
      .emit(
        "webrtc:offer",
        {
          senderSocketId:
            socket.id,
          offer:
            data.offer,
        },
      );
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
      .emit(
        "webrtc:answer",
        {
          senderSocketId:
            socket.id,
          answer:
            data.answer,
        },
      );
  }

  // =========================================================
  // WEBRTC ICE
  // =========================================================

  @SubscribeMessage(
    "webrtc:ice-candidate",
  )
  handleICECandidate(
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
}