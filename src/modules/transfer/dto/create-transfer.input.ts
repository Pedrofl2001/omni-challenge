import { IsString } from "class-validator";
import { IsNumber } from "class-validator";

export class CreateTransferInput{
  @IsString() 
  fromId: string;
  @IsString() 
  toId: string;
  @IsNumber()
  amount: number;
 
}