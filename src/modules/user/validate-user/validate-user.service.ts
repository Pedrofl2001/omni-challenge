import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../utils/interfaces/jwt-payload.interface';
import { User } from '../entities/user.entity';
import { UserRepository } from '../user.repository';

@Injectable()
export class ValidateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: JwtPayload): Promise<Partial<User>> {
    return this.userRepository.findOne(payload.username);
  }
}
