import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/modules/user/user.repository';
import { User } from 'src/modules/user/entities/user.entity';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';

@Injectable()
export class SignupService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(body: SignupDto): Promise<Partial<User>> {

    const user = await this.userRepository.findOne(body.username);

    if (user) {
      throw new BadRequestException('Usuário já existe');
    }  

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(body.password, saltRounds);

    return this.userRepository.create({...body, password: hashedPassword});
  }
}   