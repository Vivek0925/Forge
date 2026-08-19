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

  handleDisconnect(
    socket: AuthenticatedSocket,
  ) {
    /*
     * If the socket is inside a meeting,
     * remove it from that meeting first.
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
     * Existing workspace presence logic.
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
    @MessageBody() dto: JoinWorkspaceDto,
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

    this.logger.log(
      `${socket.data.currentUser.name} joined workspace ${workspace.slug}`,
    );
  }

  // =========================================================
  // WORKSPACE LEAVE
  // =========================================================

  @SubscribeMessage("workspace:leave")
  async handleWorkspaceLeave(
    @MessageBody() dto: JoinWorkspaceDto,
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
    @MessageBody() dto: SendMessageDto,
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

    const currentUser =
      socket.data.currentUser;

    /*
     * Get users already inside the meeting
     * BEFORE adding the new participant.
     */
    const existingParticipants =
      this.meetingRoomService.getParticipants(
        data.meetingId,
      );

    /*
     * Add current user.
     */
    this.meetingRoomService.join(
      data.meetingId,
      {
        socketId: socket.id,
        userId: currentUser.id,
        name: currentUser.name,
      },
    );

    /*
     * Join Socket.IO room.
     */
    socket.join(
      `meeting:${data.meetingId}`,
    );

    /*
     * Tell joining user who is already
     * inside the meeting.
     */
    socket.emit(
      "meeting:participants",
      {
        participants:
          existingParticipants,
      },
    );

    /*
     * Tell everyone else that a new user
     * has joined.
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
            userId: currentUser.id,
            name: currentUser.name,
          
          },
        },
      );

    this.logger.log(
      `${currentUser.name} joined meeting ${data.meetingId}`,
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
  // REMOVE MEETING PARTICIPANT
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

    if (!participant) {
      return;
    }

    this.meetingRoomService.leave(
      meetingId,
      socket.id,
    );

    socket.leave(
      `meeting:${meetingId}`,
    );

    /*
     * Tell remaining participants.
     */
    socket
      .to(`meeting:${meetingId}`)
      .emit(
        "meeting:participant-left",
        {
          socketId: socket.id,
          userId:
            participant.userId,
        },
      );

    this.logger.log(
      `${participant.name} left meeting ${meetingId}`,
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
  // WEBRTC ICE CANDIDATE
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