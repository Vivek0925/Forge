import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateTaskListDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;
}