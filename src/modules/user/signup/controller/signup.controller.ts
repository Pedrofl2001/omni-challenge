import { Body, Controller, Post } from '@nestjs/common';
import { SignupDto } from 'src/modules/auth/dto/signup.dto';    
import { Public } from 'src/utils/decorators/public.decorator'; 
import { User } from 'src/modules/user/entities/user.entity';
import { SignupService } from '../service/signup.service';


@Controller()
export class SignupController {
  constructor(private readonly signupService: SignupService) {}

  @Public()
  @Post('signup')
  handle(@Body() signupDto: SignupDto): Promise<Partial<User>> {
    return this.signupService.execute(signupDto);
  }
}
