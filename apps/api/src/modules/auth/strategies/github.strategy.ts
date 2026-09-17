import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-github2";

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  "github",
) {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const email =
      profile.emails?.find((email) => email.primary)?.value ??
      profile.emails?.[0]?.value;

    return {
      providerId: profile.id,
      email,
      name: profile.displayName || profile.username || "GitHub User",
      avatar: profile.photos?.[0]?.value,
    };
  }
}