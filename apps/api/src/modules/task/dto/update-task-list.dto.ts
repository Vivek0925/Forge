import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateTaskListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}