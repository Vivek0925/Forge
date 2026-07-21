import { Injectable } from '@nestjs/common';

interface OnlineUser {
  userId: string;
  socketId: string;
  workspaceId: string;
}

@Injectable()
export class PresenceService {
  private onlineUsers = new Map<string, OnlineUser>();

  addUser(user: OnlineUser) {
    this.onlineUsers.set(user.socketId, user);
  }

  removeUser(socketId: string) {
    this.onlineUsers.delete(socketId);
  }

  getUser(socketId: string) {
    return this.onlineUsers.get(socketId);
  }

  getWorkspaceUsers(workspaceId: string) {
    return [...this.onlineUsers.values()].filter(
      (user) => user.workspaceId === workspaceId,
    );
  }

  isOnline(userId: string) {
    return [...this.onlineUsers.values()].some(
      (user) => user.userId === userId,
    );
  }
}