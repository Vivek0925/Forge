import { IsUUID } from "class-validator";

export class JoinWorkspaceDto {
  @IsUUID()
    workspaceId!: string;
}