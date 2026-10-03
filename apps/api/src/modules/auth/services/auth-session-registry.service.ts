import { Injectable } from '@nestjs/common';

type DisconnectSocket = () => void;

@Injectable()
export class AuthSessionRegistry {
  private readonly sessions = new Map<
    string,
    Map<string, DisconnectSocket>
  >();

  register(userId: string, sessionId: string, disconnect: DisconnectSocket) {
    const userSessions = this.sessions.get(userId) ?? new Map();
    userSessions.set(sessionId, disconnect);
    this.sessions.set(userId, userSessions);
  }

  unregister(userId: string, sessionId: string) {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) {
      return;
    }

    userSessions.delete(sessionId);

    if (userSessions.size === 0) {
      this.sessions.delete(userId);
    }
  }

  disconnectUser(userId: string) {
    const userSessions = this.sessions.get(userId);
    if (!userSessions) {
      return;
    }

    this.sessions.delete(userId);

    for (const disconnect of userSessions.values()) {
      disconnect();
    }
  }
}
