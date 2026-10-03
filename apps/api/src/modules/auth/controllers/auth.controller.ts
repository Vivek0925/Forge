import {
  Body,
  CanActivate,
  Controller,
  Post,
  Res,
  Get,
  UseGuards,
  ExecutionContext,
  Query,
  Header,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import type { Request } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
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

const secureAuthCookie =
  process.env.NODE_ENV === 'production' ||
  process.env.FRONTEND_URL?.startsWith('https://') === true;

const authCookieOptions = {
  httpOnly: true,
  secure: secureAuthCookie,
  sameSite: secureAuthCookie ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const oauthCookieOptions = {
  httpOnly: true,
  secure: secureAuthCookie,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 10 * 60 * 1000,
};

const oauthCookieClearOptions = {
  httpOnly: true,
  secure: secureAuthCookie,
  sameSite: 'lax' as const,
  path: '/',
};

type OAuthProvider = 'google' | 'github';

function isSafeReturnTo(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !/[\r\n]/.test(value)
  );
}

function oauthStateCookieName(provider: OAuthProvider) {
  return `oauth_${provider}_state`;
}

function oauthReturnToCookieName(provider: OAuthProvider) {
  return `oauth_${provider}_return_to`;
}

function createOAuthState() {
  return randomBytes(32).toString('base64url');
}

function matchesOAuthState(expected: unknown, received: unknown) {
  if (typeof expected !== 'string' || typeof received !== 'string') {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function setOAuthInitiationCookies(
  request: Request,
  response: Response,
  provider: OAuthProvider,
) {
  const state = createOAuthState();
  const returnTo = isSafeReturnTo(request.query.returnTo)
    ? request.query.returnTo
    : '/dashboard';

  response.cookie(oauthStateCookieName(provider), state, oauthCookieOptions);
  response.cookie(
    oauthReturnToCookieName(provider),
    returnTo,
    oauthCookieOptions,
  );

  return state;
}

class OAuthStateGuard implements CanActivate {
  constructor(private readonly provider: OAuthProvider) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const state = request.query.state;
    const stateCookieName = oauthStateCookieName(this.provider);
    const stateCookie = request.cookies?.[stateCookieName];

    if (!matchesOAuthState(stateCookie, state)) {
      response.clearCookie(stateCookieName, oauthCookieClearOptions);
      response.clearCookie(
        oauthReturnToCookieName(this.provider),
        oauthCookieClearOptions,
      );
      throw new UnauthorizedException('Invalid OAuth state');
    }

    response.clearCookie(stateCookieName, oauthCookieClearOptions);
    return true;
  }
}

class GoogleOAuthStateGuard extends OAuthStateGuard {
  constructor() {
    super('google');
  }
}

class GithubOAuthStateGuard extends OAuthStateGuard {
  constructor() {
    super('github');
  }
}

class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return { state: setOAuthInitiationCookies(request, response, 'google') };
  }
}

class GithubAuthGuard extends AuthGuard('github') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return { state: setOAuthInitiationCookies(request, response, 'github') };
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

    res.cookie('access_token', token, authCookieOptions);

    return {
      message: 'Login successful',
      user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : req.cookies?.access_token;

    await this.authService.revokeToken(token);
    res.clearCookie('access_token', authCookieOptions);
    return {
      message: 'Logout successful',
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthStateGuard, AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @CurrentUser() googleUser: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const returnToCookieName = oauthReturnToCookieName('google');
    const returnTo = isSafeReturnTo(req.cookies?.[returnToCookieName])
      ? req.cookies[returnToCookieName]
      : '/dashboard';
    res.clearCookie(returnToCookieName, oauthCookieClearOptions);

    const { token } = await this.authService.googleLogin(googleUser);

    res.cookie('access_token', token, authCookieOptions);

    return res.redirect(`${process.env.FRONTEND_URL}${returnTo}`);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(GithubOAuthStateGuard, AuthGuard('github'))
  async githubCallback(
    @Req() req: Request,
    @CurrentUser() githubUser: GoogleUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const returnToCookieName = oauthReturnToCookieName('github');
    const returnTo = isSafeReturnTo(req.cookies?.[returnToCookieName])
      ? req.cookies[returnToCookieName]
      : '/dashboard';
    res.clearCookie(returnToCookieName, oauthCookieClearOptions);

    const { token } = await this.authService.githubLogin(githubUser);

    res.cookie('access_token', token, authCookieOptions);

    return res.redirect(`${process.env.FRONTEND_URL}${returnTo}`);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: CurrentUserData) {
    return user;
  }
}
