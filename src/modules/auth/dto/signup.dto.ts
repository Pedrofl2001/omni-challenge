import { IsString, IsNotEmpty, MinLength, MaxLength  } from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString({message: 'A senha deve ser uma string'})
  @IsNotEmpty()
  @MinLength(8, {message: 'A senha deve ter pelo menos 8 caracteres'})
  @MaxLength(20, {message: 'A senha deve ter no máximo 20 caracteres'})
  password: string;

  @IsString()
  @IsNotEmpty()
  birthdate: string;
}