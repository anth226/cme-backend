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
    default: 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    default: 'now()',
  })
  updatedAt: Date;

  @Column({ default: false })
  isAdmin: boolean;

  @ManyToOne(() => Guild, (guild) => guild.guildMembers)
  @JoinColumn({
    name: 'guild_id',
  })
  guild: Guild;

  @ManyToOne(() => User, (user) => user.memberGuilds, {
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
