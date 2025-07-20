import { IsNotEmpty, IsString } from "class-validator";
import { IsNumber } from "class-validator";

export class CreateTransferInput{
  @IsString()
  @IsNotEmpty()
  fromId: string;
  
  @IsString() 
  @IsNotEmpty()
  toId: string;
  
  @IsNumber()
  @IsNotEmpty()
  amount: number;
 
}