import { Module } from '@nestjs/common';
import { FindPersonByPayloadService } from './find-person-by-payload/find-person-by-payload.service';
import { UserRepository } from './user.repository';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SignupService } from './signup/signup.service';
import { SignupController } from './signup/signup.controller';
import { SigninController } from './signin/signin.controller';
import { SigninService } from './signin/signin.service';
import { ValidateUserService } from './validate-user/validate-user.service';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  providers: [FindPersonByPayloadService, UserRepository, SignupService, SigninService, ValidateUserService],
  exports: [FindPersonByPayloadService, UserRepository, ValidateUserService],
  controllers: [SignupController, SigninController],
})
export class UserModule {}  