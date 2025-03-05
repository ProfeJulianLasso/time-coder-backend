import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Activity } from '../../activity/entities/activity.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  apiKey: string;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];
}
