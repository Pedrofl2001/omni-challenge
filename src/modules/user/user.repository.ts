import { BaseRepositoryInterface } from 'src/utils/interfaces/base-repository.interface';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserRepository implements BaseRepositoryInterface<User> {
  private repository: Repository<User>;

  constructor(private readonly db: DataSource){
    this.repository = this.db.getRepository(User);
  }

    findOne(username: string): Promise<Partial<User>> {
      return this.repository.findOne({
        where: {
          username,
        },
      });
    }

  findMany(params: {
    pagination?: { skip: number; take: number };
    where?: { ids: string[] };
  }): Promise<Partial<User>[]> {
    return this.repository.find({
      where: {
        id: In(params.where.ids),
      },
    });
  }

  count(where?: Object): Promise<number> {  
    throw new Error('Method not implemented.');
  }

  create(data: SignupDto): Promise<Partial<User>> {
    return this.repository.insert(data).then(result => ({ id: result.identifiers[0].id }));
  }

  update(id: string, data: {balance: number}): Promise<Partial<User>> {
    return this.repository.update(id, data).then(result => ({ id }));
  }

  delete(id: number | string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
