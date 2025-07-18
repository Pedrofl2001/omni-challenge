import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { User } from '../entities/user.entity';
import { UserRepository } from '../user.repository';

@Injectable()
export class FindPersonByPayloadService {

  constructor(private readonly userRepository: UserRepository) {}

  async execute(payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.userRepository.findOne(payload.username);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');    
    }

    return user;
  } 
}
