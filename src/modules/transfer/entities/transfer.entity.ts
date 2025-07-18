import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToOne, JoinColumn, Generated, PrimaryColumn } from 'typeorm';

@Entity()
export class Transfer {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'fromId' })
  fromId: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'toId' })
  toId: string;

  @Column()
  amount: number;
  
  @CreateDateColumn()
  createdAt: Date;
  
}