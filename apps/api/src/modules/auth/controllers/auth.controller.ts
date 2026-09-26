import { Body, Controller, Post, Res, Get, UseGuards, ExecutionContext, Query} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { CurrentUserData } from '../interfaces/current-user.interface';

interface GoogleUser {
  providerId: string;
  email?: string;
  name: string;
  avatar?: string;
}

class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const returnTo = request.query.returnTo;

    return {
      state:
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//')
          ? returnTo
          : '/dashboard',
    };
  }
}

class GithubAuthGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const returnTo = request.query.returnTo;

    return {
      state:
        typeof returnTo === 'string' &&
        returnTo.startsWith('/') &&
        !returnTo.startsWith('//')
          ? returnTo
          : '/dashboard',
    };
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.authService.login(loginDto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successful',
      user,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return {
      message: 'Logout successful',
    };
  }

 @Get('google')
@UseGuards(GoogleAuthGuard)
googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
 async googleCallback(
  @CurrentUser() googleUser: GoogleUser,
  @Query('state') state: string,
  @Res({ passthrough: true }) res: Response,
) {
    const { token } = await this.authService.googleLogin(googleUser);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo =
  state && state.startsWith('/') && !state.startsWith('//')
    ? state
    : '/dashboard';

return res.redirect(
  `${process.env.FRONTEND_URL}${returnTo}`,
);
  }

 @Get('github')
@UseGuards(GithubAuthGuard)
githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
 async githubCallback(
  @CurrentUser() githubUser: GoogleUser,
  @Query('state') state: string,
  @Res({ passthrough: true }) res: Response,
) {
    const { token } = await this.authService.githubLogin(githubUser);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo =
  state && state.startsWith('/') && !state.startsWith('//')
    ? state
    : '/dashboard';

return res.redirect(
  `${process.env.FRONTEND_URL}${returnTo}`,
);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: CurrentUserData) {
    return user;
  }
}
