import { Injectable } from "@nestjs/common";

interface MeetingParticipant {
  socketId: string;
  userId: string;
  name: string;
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
  ) {
    if (!this.rooms.has(meetingId)) {
      this.rooms.set(
        meetingId,
        new Map(),
      );
    }

    const room = this.rooms.get(meetingId)!;

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
  ) {
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

  getParticipants(
    meetingId: string,
  ) {
    const room =
      this.rooms.get(meetingId);

    if (!room) {
      return [];
    }

    return Array.from(room.values());
  }

  getParticipant(
    meetingId: string,
    socketId: string,
  ) {
    return this.rooms
      .get(meetingId)
      ?.get(socketId);
  }

  getMeetingForSocket(
    socketId: string,
  ) {
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
}