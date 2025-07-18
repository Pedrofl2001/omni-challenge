import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [  
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    JwtAuthGuard,
    JwtStrategy,
  ],
  exports: [JwtAuthGuard],
  imports: [UserModule, DatabaseModule, JwtModule],
})
export class AuthModule {}
