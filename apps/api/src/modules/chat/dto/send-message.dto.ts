import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @IsString()
  fileName!: string;

  @IsString()
  key!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  size!: number;
}

export class SendMessageDto {
  @IsString()
  workspaceSlug!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
  @IsOptional()
  @IsString()
  replyToId?: string;
}
