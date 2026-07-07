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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
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
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        "Please login with your social account",
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}