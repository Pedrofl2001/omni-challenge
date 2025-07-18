import { User } from "../../entities/user.entity";

export class FindManyUsersOutput {
  users: Partial<User>[];
  hasNextPage: boolean;
  totalCount: number;
}