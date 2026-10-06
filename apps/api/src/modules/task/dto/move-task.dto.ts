import { IsEnum, IsInt, Min } from 'class-validator';

import { TaskStatus } from '@prisma/client';

export class MoveTaskDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsInt()
  @Min(0)
  position!: number;
}