import { BaseRepositoryInterface } from 'src/utils/interfaces/base-repository.interface';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Transfer } from './entities/transfer.entity';
import { CreateTransferInput } from './dto/create-transfer.input';

@Injectable()
export class TransferRepository implements BaseRepositoryInterface<Transfer> {
  private repository: Repository<Transfer>;

  constructor(private readonly db: DataSource){
    this.repository = this.db.getRepository(Transfer);
  }
  
findOne(id: number | string): Promise<Partial<Transfer>> {
        throw new Error('Method not implemented.');
    }

  findMany(params: {
    pagination?: { skip: number; take: number };
    where?: Object;
  }): Promise<Partial<Transfer>[]> {
    throw new Error('Method not implemented.');
  }

  count(where?: Object): Promise<number> {  
    throw new Error('Method not implemented.');
  }

  create(data: CreateTransferInput): Promise<Partial<Transfer>> {
    return this.repository.insert(data).then(result => ({ id: result.identifiers[0].id }));
  }

  update(id: string, data: Object): Promise<Partial<Transfer>> {
    return this.repository.update(id, data).then(result => ({ id }));
  }

  delete(id: string): Promise<boolean> {
    return this.repository.delete(id).then(result => result.affected > 0);
  }
}
