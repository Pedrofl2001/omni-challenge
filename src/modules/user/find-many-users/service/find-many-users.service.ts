import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../user.repository";
import { FindManyUsersInput } from "../../dto/inputs/find-many-users.input";
import { FindManyUsersOutput } from "../../dto/outputs/find-many-users.output";

@Injectable()
export class FindManyUsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: FindManyUsersInput): Promise<FindManyUsersOutput> {

    const { ids, pagination } = input;

    const { skip, take } = pagination || { skip: 0, take: 10 };

    const users = await this.userRepository.findMany({where: {ids}, pagination: {skip, take}});

    const totalCount = await this.userRepository.count({ids});

    const hasNextPage = take + skip < totalCount;

    return {
      users,
      hasNextPage,
      totalCount,
    };
    
  }
}