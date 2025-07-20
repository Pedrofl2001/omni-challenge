import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { FindManyUsersService } from "../service/find-many-users.service";
import { FindManyUsersInput } from "../../dto/inputs/find-many-users.input";
import { FindManyUsersOutput } from "../../dto/outputs/find-many-users.output";

@Controller()
export class FindManyUsersController {
  constructor(private readonly findManyUsersService: FindManyUsersService) {}

  @Get()
  async handle(@Query() query: FindManyUsersInput): Promise<FindManyUsersOutput> {
    return this.findManyUsersService.execute(query);
  }
}