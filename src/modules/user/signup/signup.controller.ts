import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from '../../auth/dto/signup.dto';    
import { Public } from 'src/utils/decorators/public.decorator'; 
import { User } from '../entities/user.entity';
import { SignupService } from './signup.service';


@Controller()
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Public()
  @Post('signup')
  handle(@Body() signupDto: SignupDto): Promise<Partial<User>> {
    return this.signupService.execute(signupDto);
  }
}
