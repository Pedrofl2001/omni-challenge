import { Body, Controller, Post } from "@nestjs/common";
import { CreateTransferService } from "./create-transfer.service";
import { CreateTransferInput } from "../dto/create-transfer.input";

@Controller()
export class CreateTransferController {
  constructor(private readonly createTransferService: CreateTransferService) {}

  @Post()
  async handle(@Body() body: CreateTransferInput): Promise<void> {
    return this.createTransferService.execute(body);
  }
}   