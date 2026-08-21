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

  join(
    meetingId: string,
    participant: MeetingParticipant,
  ): MeetingParticipant[] {
    let room = this.rooms.get(meetingId);

    if (!room) {
      room = new Map<
        string,
        MeetingParticipant
      >();

      this.rooms.set(
        meetingId,
        room,
      );
    }

    room.set(
      participant.socketId,
      participant,
    );

    return this.getParticipants(
      meetingId,
    );
  }

  leave(
    meetingId: string,
    socketId: string,
  ): MeetingParticipant[] {
    const room =
      this.rooms.get(meetingId);

    if (!room) {
      return [];
    }

    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(meetingId);

      return [];
    }

    return this.getParticipants(
      meetingId,
    );
  }

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

  updateParticipantState(
    meetingId: string,
    socketId: string,
    state: {
      micEnabled?: boolean;
      cameraEnabled?: boolean;
    },
  ): MeetingParticipant | undefined {
    const room =
      this.rooms.get(meetingId);

    if (!room) {
      return undefined;
    }

    const participant =
      room.get(socketId);

    if (!participant) {
      return undefined;
    }

    const updatedParticipant: MeetingParticipant =
      {
        ...participant,
        ...state,
      };

    room.set(
      socketId,
      updatedParticipant,
    );

    return updatedParticipant;
  }

  getParticipants(
    meetingId: string,
  ): MeetingParticipant[] {
    const room =
      this.rooms.get(meetingId);

    if (!room) {
      return [];
    }

    return Array.from(
      room.values(),
    );
  }

  getParticipant(
    meetingId: string,
    socketId: string,
  ): MeetingParticipant | undefined {
    return this.rooms
      .get(meetingId)
      ?.get(socketId);
  }

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

  clearMeeting(
    meetingId: string,
  ): void {
    this.rooms.delete(meetingId);
  }
}