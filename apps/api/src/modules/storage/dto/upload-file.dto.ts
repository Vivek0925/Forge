import { IsIn } from "class-validator";

export class UploadFileDto {
  @IsIn([
    "chat",
    "avatars",
    "workspace-icons",
    "documents",
    "whiteboards",
  ])
  folder!: string;
}