import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Activity } from '../../activity/entities/activity.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'varchar', length: 26 })
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, name: 'api_key' })
  apiKey: string;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Activity[];
}
