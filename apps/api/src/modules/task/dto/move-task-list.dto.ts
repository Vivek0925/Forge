import { IsInt, Min } from "class-validator";

export class MoveTaskListDto {
  @IsInt()
  @Min(0)
  position!: number;
}