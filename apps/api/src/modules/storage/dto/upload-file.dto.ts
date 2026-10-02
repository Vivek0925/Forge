import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsIn(['chat', 'avatars', 'workspace-icons', 'documents', 'whiteboards'])
  folder!: string;

  @IsOptional()
  @IsString()
  workspaceSlug?: string;
}
