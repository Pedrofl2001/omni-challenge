import { Transfer } from 'src/modules/transfer/entities/transfer.entity';
import { Entity, Column,  PrimaryColumn, Generated, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  birthdate: string;

  @Column({ default: 0 })
  balance: number;

  @OneToMany(() => Transfer, (transfer) => transfer.fromId, { cascade: true })
  transfersFrom: Transfer[];
  
  @OneToMany(() => Transfer, (transfer) => transfer.toId, { cascade: true })
  transfersTo: Transfer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
