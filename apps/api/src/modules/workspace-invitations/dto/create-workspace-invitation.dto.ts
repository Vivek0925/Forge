import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class CreateWorkspaceInvitationDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(WorkspaceRole)
  role?: WorkspaceRole;
}