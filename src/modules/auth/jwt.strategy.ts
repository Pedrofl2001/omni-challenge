import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../utils/interfaces/jwt-payload.interface';
import { ValidateUserService } from '../user/validate-user/validate-user.service';
import { ConfigService } from '@nestjs/config';
import { Algorithm } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly validateUserService: ValidateUserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: [configService.get<string>('JWT_ALGORITHM') || 'HS256' as Algorithm],
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.validateUserService.execute(payload);

    if (!user) {
      throw new UnauthorizedException('Token inválido');
    }

    return user;
  }
}
