import {
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import * as cookie from "cookie";

import { PrismaService } from "../../../database/prisma.service";
import { CurrentUserData } from "../../auth/interfaces/current-user.interface";
import { parse } from "path/win32";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class SocketAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async authenticate(
    socket: Socket,
  ): Promise<CurrentUserData> {
    const cookieHeader =
      socket.handshake.headers.cookie;

    if (!cookieHeader) {
      throw new UnauthorizedException(
        "Authentication required",
      );
    }

    const cookies = cookie.parse(cookieHeader);

const token = cookies.access_token;

    if (!token) {
      throw new UnauthorizedException(
        "Authentication required",
      );
    }

    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(
        token,
      );
    } catch {
      throw new UnauthorizedException(
        "Invalid token",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        "User not found",
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}