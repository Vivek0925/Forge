import {
  ConnectedSocket,
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

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
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
        `${currentUser.name} connected`,
      );
    } catch (error) {
      this.logger.warn("Unauthorized socket connection");
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    const user = this.presenceService.getUser(socket.id);

    if (!user) return;

    this.presenceService.removeUser(socket.id);

    socket.to(`workspace:${user.workspaceId}`).emit(
      "presence:update",
      {
        users: this.presenceService.getWorkspaceUsers(
          user.workspaceId,
        ),
      },
    );

    this.logger.log(`${user.userId} disconnected`);
  }

  @SubscribeMessage("workspace:join")
  handleWorkspaceJoin(
    @ConnectedSocket() socket: AuthenticatedSocket,
    workspaceId: string,
  ) {
    socket.join(`workspace:${workspaceId}`);

    this.presenceService.addUser({
      socketId: socket.id,
      workspaceId,
      userId: socket.data.currentUser.id,
    });

    this.server.to(`workspace:${workspaceId}`).emit(
      "presence:update",
      {
        users: this.presenceService.getWorkspaceUsers(
          workspaceId,
        ),
      },
    );

    this.logger.log(
      `${socket.data.currentUser.name} joined workspace ${workspaceId}`,
    );
  }

  @SubscribeMessage("workspace:leave")
  handleWorkspaceLeave(
    @ConnectedSocket() socket: AuthenticatedSocket,
    workspaceId: string,
  ) {
    socket.leave(`workspace:${workspaceId}`);

    this.presenceService.removeUser(socket.id);

    this.server.to(`workspace:${workspaceId}`).emit(
      "presence:update",
      {
        users: this.presenceService.getWorkspaceUsers(
          workspaceId,
        ),
      },
    );

    this.logger.log(
      `${socket.data.currentUser.name} left workspace ${workspaceId}`,
    );
  }
}