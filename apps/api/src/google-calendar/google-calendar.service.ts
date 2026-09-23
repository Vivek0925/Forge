import { Injectable } from "@nestjs/common";
import { google } from "googleapis";
import type { Credentials } from "google-auth-library";

@Injectable()
export class GoogleCalendarService {
  private readonly oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALENDAR_REDIRECT_URI,
  );

  getAuthorizationUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });
  }

  async handleCallback(code: string): Promise<{
  message: string;
  tokens: Credentials;
}> {
  const { tokens } =
    await this.oauth2Client.getToken(code);

  return {
    message: "Google Calendar connected",
    tokens,
  };
}
}