import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

  @OneToMany(() => GuildMembers, (guildMembers) => guildMembers.guild, {
    eager: true,
    onDelete: 'CASCADE',
  })
  guildMembers: GuildMembers[];
}
