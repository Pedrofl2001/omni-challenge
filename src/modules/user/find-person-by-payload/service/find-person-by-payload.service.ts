import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtPayload } from 'src/utils/interfaces/jwt-payload.interface';
import { User } from 'src/modules/user/entities/user.entity';
import { UserRepository } from 'src/modules/user/user.repository';

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
