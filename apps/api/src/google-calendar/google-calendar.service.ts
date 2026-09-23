import { Injectable } from "@nestjs/common";
import { google } from "googleapis";


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

  async handleCallback(
  code: string,
  userId: string,
): Promise<void> {
  const { tokens } =
    await this.oauth2Client.getToken(code);

  console.log("Google Calendar connected for:", userId);
  console.log("Token received:", !!tokens.access_token);
}
}