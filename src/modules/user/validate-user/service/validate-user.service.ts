import { Injectable } from '@nestjs/common';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { User } from 'src/modules/user/entities/user.entity';
import { UserRepository } from 'src/modules/user/user.repository';

@Injectable()
export class ValidateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: JwtPayload): Promise<Partial<User>> {
    return this.userRepository.findOne(payload.username);
  }
}
