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
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const currentUser =
        await this.socketAuthService.authenticate(socket);

      socket.data.currentUser = currentUser;

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
  async handleWorkspaceJoin(
    @MessageBody() dto: JoinWorkspaceDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
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

    socket.join(`workspace:${workspace.id}`);

    this.presenceService.addUser({
      socketId: socket.id,
      workspaceId: workspace.id,
      userId: socket.data.currentUser.id,
      name: socket.data.currentUser.name,
      email: socket.data.currentUser.email,
    });

    this.server
      .to(`workspace:${workspace.id}`)
      .emit("presence:update", {
        users: this.presenceService.getWorkspaceUsers(
          workspace.id,
        ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} joined workspace ${workspace.slug}`,
    );
  }

  @SubscribeMessage("workspace:leave")
  async handleWorkspaceLeave(
    @MessageBody() dto: JoinWorkspaceDto,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const workspace = await this.prisma.workspace.findUnique({
      where: {
        slug: dto.workspaceSlug,
      },
    });

    if (!workspace) {
      return;
    }

    socket.leave(`workspace:${workspace.id}`);

    this.presenceService.removeUser(socket.id);

    this.server
      .to(`workspace:${workspace.id}`)
      .emit("presence:update", {
        users: this.presenceService.getWorkspaceUsers(
          workspace.id,
        ),
      });

    this.logger.log(
      `${socket.data.currentUser.name} left workspace ${workspace.slug}`,
    );
  }
}