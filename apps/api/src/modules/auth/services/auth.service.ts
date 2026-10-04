import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../../../database/prisma.service";
import { LoginDto } from "../dto/login.dto";
import { RegisterDto } from "../dto/register.dto";
import { AuthSessionRegistry } from "./auth-session-registry.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly authSessionRegistry: AuthSessionRegistry,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return {
      message: "Account created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.createToken(user.id, user.email, user.tokenVersion);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async googleLogin(profile: {
    providerId: string;
    email?: string;
    name: string;
    avatar?: string;
  }) {
    return this.oauthLogin('GOOGLE', profile);
  }

  async githubLogin(profile: {
    providerId: string;
    email?: string;
    name: string;
    avatar?: string;
  }) {
    return this.oauthLogin('GITHUB', profile);
  }

  async revokeToken(token?: string) {
    if (!token) {
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(token);

      await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });

      this.authSessionRegistry.disconnectUser(payload.sub);
    } catch {
      // Logout still clears the client cookie when the submitted token is invalid.
    }
  }

  private async oauthLogin(
    provider: 'GOOGLE' | 'GITHUB',
    profile: {
      providerId: string;
      email?: string;
      name: string;
      avatar?: string;
    },
  ) {
    let user = await this.prisma.user.findFirst({
      where: {
        provider,
        providerId: profile.providerId,
      },
    });

    if (!user && profile.email) {
      const emailUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (emailUser) {
        throw new UnauthorizedException(
          'This email is already associated with another account',
        );
      }
    }

    if (!user) {
      if (!profile.email) {
        throw new UnauthorizedException(
          `${provider} account does not provide an email`,
        );
      }

      user = await this.prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          provider,
          providerId: profile.providerId,
          emailVerified: true,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: profile.avatar,
        },
      });
    }

    const token = await this.createToken(
      user.id,
      user.email,
      user.tokenVersion,
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  private createToken(userId: string, email: string, tokenVersion: number) {
    return this.jwtService.signAsync({
      sub: userId,
      email,
      tokenVersion,
    });
  }
}