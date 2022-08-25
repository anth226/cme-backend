import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Guild } from '../guild/guild.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'guilds_users' })
@Unique(['guild', 'user'])
export class GuildMembers {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => Guild, (guild) => guild.guildMembers)
  @JoinColumn({
    name: 'guild_id',
  })
  guild: Guild;

  @ManyToOne(() => User, (user) => user.guildUsers, {
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
