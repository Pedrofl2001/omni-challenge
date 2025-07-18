import { IsString, IsNotEmpty, MinLength, MaxLength  } from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(11)
  @MaxLength(11)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @IsString()
  @IsNotEmpty()
  birthdate: string;
}