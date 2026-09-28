import { IsNotEmpty, IsString } from 'class-validator';

export class ReactMessageDto {
  @IsString()
  @IsNotEmpty()
  messageId!: string;

  @IsString()
  @IsNotEmpty()
  emoji!: string;
}
