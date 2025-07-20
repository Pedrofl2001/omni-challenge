import { Module } from '@nestjs/common';
import { FindPersonByPayloadService } from './find-person-by-payload/service/find-person-by-payload.service';
import { UserRepository } from './user.repository';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { SignupService } from './signup/service/signup.service';
import { SignupController } from './signup/controller/signup.controller';
import { SigninController } from './signin/controller/signin.controller';
import { SigninService } from './signin/service/signin.service';
import { ValidateUserService } from './validate-user/service/validate-user.service';
import { FindManyUsersService } from './find-many-users/service/find-many-users.service';
import { FindManyUsersController } from './find-many-users/controller/find-many-users.controller';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([User])],
  providers: [FindPersonByPayloadService, UserRepository, SignupService, SigninService, ValidateUserService, FindManyUsersService],
  exports: [FindPersonByPayloadService, UserRepository, ValidateUserService],
  controllers: [SignupController, SigninController, FindManyUsersController],
})
export class UserModule {}  