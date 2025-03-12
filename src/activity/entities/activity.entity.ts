import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'activities' })
export class Activity {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string;

  @Column({ name: 'user_id' })
  @Index('activities_user_id_index')
  userId: string;

  @Column()
  @Index('activities_project_index')
  project: string;

  @Column()
  file: string;

  @Column()
  @Index('activities_language_index')
  language: string;

  @Column('int8')
  @Index('activities_start_time_index')
  startTime: number;

  @Column('int8')
  @Index('activities_end_time_index')
  endTime: number;

  @Column('float8')
  duration: number;

  @Column()
  @Index('activities_branch_index')
  branch: string;

  @Column()
  @Index('activities_debug_index')
  debug: boolean;

  @Column()
  machine: string;

  @Column()
  @Index('activities_platform_index')
  platform: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activities)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
