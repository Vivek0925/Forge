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

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly socketAuthService: SocketAuthService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const currentUser =
        await this.socketAuthService.authenticate(socket);

      socket.data.currentUser = currentUser;

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

  handleDisconnect(socket: AuthenticatedSocket) {
    const onlineUser = this.presenceService.getUser(socket.id);

    if (!onlineUser) return;

    this.presenceService.removeUser(socket.id);

    this.server
      .to(`workspace:${onlineUser.workspaceId}`)
      .emit("presence:update", {
        users: this.presenceService.getWorkspaceUsers(
          onlineUser.workspaceId,
        ),
      });

    this.logger.log(
      `${onlineUser.name} disconnected`,
    );
  }

  @SubscribeMessage("workspace:join")
  handleWorkspaceJoin(
    @MessageBody() dto: JoinWorkspaceDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { workspaceId } = dto;

    socket.join(`workspace:${workspaceId}`);

    this.presenceService.addUser({
      socketId: socket.id,
      workspaceId,
      userId: socket.data.currentUser.id,
      name: socket.data.currentUser.name,
      email: socket.data.currentUser.email,
    });

    this.server
      .to(`workspace:${workspaceId}`)
      .emit("presence:update", {
        users:
          this.presenceService.getWorkspaceUsers(
            workspaceId,
          ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} joined workspace ${workspaceId}`,
    );
  }

  @SubscribeMessage("workspace:leave")
  handleWorkspaceLeave(
    @MessageBody() dto: JoinWorkspaceDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { workspaceId } = dto;

    socket.leave(`workspace:${workspaceId}`);

    this.presenceService.removeUser(socket.id);

    this.server
      .to(`workspace:${workspaceId}`)
      .emit("presence:update", {
        users:
          this.presenceService.getWorkspaceUsers(
            workspaceId,
          ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} left workspace ${workspaceId}`,
    );
  }
}