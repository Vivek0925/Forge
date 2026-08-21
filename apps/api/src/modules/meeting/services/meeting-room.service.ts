import { Injectable } from "@nestjs/common";

export interface MeetingParticipant {
  socketId: string;
  userId: string;
  name: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

@Injectable()
export class MeetingRoomService {
  private readonly rooms = new Map<
    string,
    Map<string, MeetingParticipant>
  >();

  /**
   * Add a participant to a meeting.
   */
  join(
    meetingId: string,
    participant: MeetingParticipant,
  ): MeetingParticipant[] {
    let room = this.rooms.get(meetingId);

    if (!room) {
      room = new Map<string, MeetingParticipant>();
      this.rooms.set(meetingId, room);
    }

    room.set(participant.socketId, participant);

    return this.getParticipants(meetingId);
  }

  /**
   * Remove a participant from a meeting.
   */
  leave(
    meetingId: string,
    socketId: string,
  ): MeetingParticipant[] {
    const room = this.rooms.get(meetingId);

    if (!room) {
      return [];
    }

    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(meetingId);
      return [];
    }

    return this.getParticipants(meetingId);
  }

  /**
   * Update microphone/camera state.
   */
  updateParticipantState(
    meetingId: string,
    socketId: string,
    state: {
      micEnabled?: boolean;
      cameraEnabled?: boolean;
    },
  ): MeetingParticipant | undefined {
    const room = this.rooms.get(meetingId);

    if (!room) {
      return undefined;
    }

    const participant = room.get(socketId);

    if (!participant) {
      return undefined;
    }

    const updatedParticipant: MeetingParticipant = {
      ...participant,
      ...(state.micEnabled !== undefined && {
        micEnabled: state.micEnabled,
      }),
      ...(state.cameraEnabled !== undefined && {
        cameraEnabled: state.cameraEnabled,
      }),
    };

    room.set(socketId, updatedParticipant);

    return updatedParticipant;
  }

  /**
   * Get every participant in a meeting.
   */
  getParticipants(
    meetingId: string,
  ): MeetingParticipant[] {
    const room = this.rooms.get(meetingId);

    if (!room) {
      return [];
    }

    return Array.from(room.values());
  }

  /**
   * Get a specific participant.
   */
  getParticipant(
    meetingId: string,
    socketId: string,
  ): MeetingParticipant | undefined {
    return this.rooms
      .get(meetingId)
      ?.get(socketId);
  }

  /**
   * Find which meeting a socket currently belongs to.
   */
  getMeetingForSocket(
    socketId: string,
  ): string | undefined {
    for (const [
      meetingId,
      room,
    ] of this.rooms.entries()) {
      if (room.has(socketId)) {
        return meetingId;
      }
    }

    return undefined;
  }

  /**
   * Check whether a socket is already inside
   * a specific meeting.
   */
  hasParticipant(
    meetingId: string,
    socketId: string,
  ): boolean {
    return (
      this.rooms
        .get(meetingId)
        ?.has(socketId) ?? false
    );
  }

  /**
   * Remove the entire meeting room.
   */
  clearMeeting(
    meetingId: string,
  ): void {
    this.rooms.delete(meetingId);
  }

  /**
   * Remove a socket from every meeting.
   *
   * Useful as a safety net when a browser refreshes
   * or the socket disconnects unexpectedly.
   */
  removeSocket(
    socketId: string,
  ): string | undefined {
    for (const [
      meetingId,
      room,
    ] of this.rooms.entries()) {
      if (!room.has(socketId)) {
        continue;
      }

      room.delete(socketId);

      if (room.size === 0) {
        this.rooms.delete(meetingId);
      }

      return meetingId;
    }

    return undefined;
  }
}