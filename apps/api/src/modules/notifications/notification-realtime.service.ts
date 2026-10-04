import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

@Injectable()
export class NotificationRealtimeService {
  private server: Server | null = null;

  setServer(server: Server) {
    this.server = server;
  }

  emitToUser(userId: string, notification: unknown) {
    if (!this.server) return;

    for (const socket of this.server.sockets.sockets.values()) {
      if (socket.data.currentUser?.id === userId) {
        socket.emit('notification:new', notification);
      }
    }
  }
}
