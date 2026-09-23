import { Controller, Get, Query, Res,Request } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly googleCalendarService: GoogleCalendarService) {}

  @Get('connect')
  connect(@Res() res: Response) {
    const url = this.googleCalendarService.getAuthorizationUrl();

    return res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Request() req: any,
  ): Promise<{
    message: string;
  }> {
    await this.googleCalendarService.handleCallback(code, req.user.id);

    return {
      message: 'Google Calendar connected successfully',
    };
  }
}
