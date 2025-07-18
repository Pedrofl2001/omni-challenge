import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TransferRepository } from "../transfer.repository";
import { CreateTransferInput } from "../dto/create-transfer.input";
import { UserRepository } from "src/modules/user/user.repository";

@Injectable()
export class CreateTransferService {
  constructor(private readonly transferRepository: TransferRepository, private readonly userRepository: UserRepository) {}

async execute(body: CreateTransferInput): Promise<void> {

    const totalUsers = 2;

    const users = await this.userRepository.findMany({where: {ids: [body.fromId, body.toId]}});


    if (users.length !== totalUsers) {
      throw new NotFoundException('Algum dos usuários não foi encontrado');
    }

    const fromUser = users.find(user => user.id === body.fromId);
    
    const toUser = users.find(user => user.id === body.toId);

    if (fromUser.balance < body.amount) {
      throw new BadRequestException('Saldo insuficiente para transferir');
    }

    fromUser.balance -= body.amount;
    toUser.balance += body.amount;

    await this.userRepository.update(fromUser.id, {balance: fromUser.balance});
    await this.userRepository.update(toUser.id, {balance: toUser.balance});


    await this.transferRepository.create(body);

  }
}       