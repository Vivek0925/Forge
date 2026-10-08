import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class MoveTaskDto {
  @IsString()
  @IsNotEmpty()
  listId!: string;

  @IsInt()
  @Min(0)
  position!: number;
}