import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository} from 'src/modules/user/user.repository';
import { SigninDto } from 'src/modules/auth/dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; 
import { SigninOutput } from '../../dto/outputs/signin.output';  

@Injectable()
export class SigninService {
  constructor(private readonly userRepository: UserRepository, private readonly jwtService: JwtService) {}

  async execute(body: SigninDto): Promise<SigninOutput> {
    const user = await this.userRepository.findOne(body.username);

    if (!user) { 
      throw new NotFoundException('Usuário não encontrado');
    }

    const areEqual = await bcrypt.compare(body.password, user.password);  

    if (!areEqual) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {token: this._createToken(body), expiresIn: process.env.JWT_EXPIRES_IN};

  }

  private _createToken(user: SigninDto): string {

    const tokenPayload = { username: user.username };

    return this.jwtService.sign(tokenPayload);
  }
}
