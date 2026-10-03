import {
  Controller,
  Get,
  Query,
  Res,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { GoogleCalendarService } from './google-calendar.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('connect')
  async connect(@Request() req: any, @Res() res: Response) {
    const { url, state } =
      await this.googleCalendarService.getAuthorizationUrl(req.user.id);

    res.cookie('google_calendar_oauth_state', state, {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        process.env.FRONTEND_URL?.startsWith('https://') === true,
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000,
    });

    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    message: string;
  }> {
    const stateCookie = req.cookies?.google_calendar_oauth_state;

    try {
      if (!this.matchesState(stateCookie, state)) {
        throw new UnauthorizedException(
          'Invalid Google Calendar OAuth state',
        );
      }

      await this.googleCalendarService.consumeAuthorizationState(
        state,
        req.user.id,
      );
      await this.googleCalendarService.handleCallback(code, req.user.id);
    } finally {
      res.clearCookie('google_calendar_oauth_state', {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === 'production' ||
          process.env.FRONTEND_URL?.startsWith('https://') === true,
        sameSite: 'lax',
        path: '/',
      });
    }

    return {
      message: 'Google Calendar connected successfully',
    };
  }

  @Get('status')
  async status(@Request() req: any) {
    return this.googleCalendarService.getConnectionStatus(req.user.id);
  }

  private matchesState(expected: unknown, received: unknown) {
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
}
