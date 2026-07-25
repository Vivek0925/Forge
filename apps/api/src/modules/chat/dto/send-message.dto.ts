import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  workspaceSlug!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}