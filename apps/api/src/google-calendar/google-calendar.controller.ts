import { Controller, Get, Query, Res } from "@nestjs/common";
import type { Response } from "express";
import { GoogleCalendarService } from "./google-calendar.service";

@Controller("google-calendar")
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  @Get("connect")
  connect(@Res() res: Response) {
    const url =
      this.googleCalendarService.getAuthorizationUrl();

    return res.redirect(url);
  }

  @Get("callback")
async callback(
  @Query("code") code: string,
) {
  return this.googleCalendarService.handleCallback(code);
}
}