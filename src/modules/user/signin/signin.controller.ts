import { Body, Controller, Post } from '@nestjs/common';
import { SigninService } from './signin.service';
import { SigninDto } from '../../auth/dto/signin.dto';
import { Public } from 'src/utils/decorators/public.decorator';
import { SigninOutput } from '../dto/signin.output';

@Controller()
export class SigninController {
    constructor(private readonly signinService: SigninService) {}

  @Public()
  @Post('signin')
  handle(@Body() signinDto: SigninDto): Promise<SigninOutput> {
    return this.signinService.execute(signinDto);
  }
}
