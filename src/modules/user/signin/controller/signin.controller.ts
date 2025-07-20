import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/utils/decorators/public.decorator';
import { SigninOutput } from '../../dto/outputs/signin.output';
import { SigninService } from '../service/signin.service';
import { SigninDto } from 'src/modules/auth/dto/signin.dto';

@Controller()
export class SigninController {
    constructor(private readonly signinService: SigninService) {}

  @Public()
  @Post('signin')
  handle(@Body() signinDto: SigninDto): Promise<SigninOutput> {
    return this.signinService.execute(signinDto);
  }
}
