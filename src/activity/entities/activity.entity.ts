import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project: string;

  @Column()
  file: string;

  @Column()
  language: string;

  @Column('bigint')
  startTime: number;

  @Column('bigint')
  endTime: number;

  @Column('float')
  duration: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @Column({ nullable: true })
  gitBranch: string;
}
