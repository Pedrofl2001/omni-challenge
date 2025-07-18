import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { CreateTransferService } from "./create-transfer.service";
import { CreateTransferInput } from "../dto/create-transfer.input";

@Controller()
export class CreateTransferController {
  constructor(private readonly createTransferService: CreateTransferService) {}

  @Post()
  @HttpCode(204)
  async handle(@Body() body: CreateTransferInput): Promise<void> {
    return this.createTransferService.execute(body);
  }
}   