import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { DatabaseModule } from './modules/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { TransferModule } from './modules/transfer/transfer.module';
import { RouterModule } from '@nestjs/core';
import { Algorithm } from 'jsonwebtoken';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: process.env.JWT_ALGORITHM as Algorithm },
    }),
    UserModule,
    AuthModule,
    TransferModule,
    RouterModule.register([
      {
        path: 'transfer',
        module: TransferModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
