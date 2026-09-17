  import { Module } from "@nestjs/common";
  import { JwtModule } from "@nestjs/jwt";

  import { PrismaModule } from "../../database/prisma.module";

  import { AuthController } from "./controllers/auth.controller";
  import { AuthService } from "./services/auth.service";
  import { JwtStrategy } from "./strategies/jwt.strategy";
  import { GoogleStrategy } from "./strategies/google.strategy";
  import { GithubStrategy } from "./strategies/github.strategy";

  @Module({
    imports: [
      PrismaModule,
      JwtModule.register({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: "7d",
        },
      }),
    ],
    controllers: [AuthController],
    providers: [
      AuthService,
      JwtStrategy,
      GoogleStrategy,
      GithubStrategy,
    ],
    exports: [JwtModule],
  })
  export class AuthModule {}