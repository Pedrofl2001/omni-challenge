import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transfer } from './entities/transfer.entity';
import { CreateTransferController } from './create-transfer/create-transfer.controller';
import { CreateTransferService } from './create-transfer/create-transfer.service';
import { TransferRepository } from './transfer.repository';
import { UserRepository } from '../user/user.repository';
  
@Module({
  imports: [TypeOrmModule.forFeature([Transfer])],
  controllers: [CreateTransferController],
  providers: [CreateTransferService, TransferRepository, UserRepository],
  exports: [TypeOrmModule],
})
export class TransferModule {}