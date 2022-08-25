import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'guilds' })
export class Guild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @OneToMany(() => GuildMembers, (guildMembers) => guildMembers.guild, {
    eager: true,
    onDelete: 'CASCADE',
  })
  guildMembers: GuildMembers[];
}
