import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';

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
    default: 'NOW()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    default: 'NOW()',
  })
  updatedAt: Date;

  @OneToMany(() => GuildMembers, (guildMembers) => guildMembers.guild, {
    eager: true,
    onDelete: 'CASCADE',
  })
  guildMembers: GuildMembers[];
}
