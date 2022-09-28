import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Village } from '../villages/village.entity';
import { Exclude } from 'class-transformer';
import { Attack } from '../attacks/attack.entity';
import { GuildMembers } from '../guild-members/guild-users.entity';

@Entity({ name: 'users' })
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @Column()
  eth_wallet_addresses: string;

  @Column()
  eth_private_key: string;

  @Column()
  derive: number;

  @Column()
  new: boolean;

  @Column()
  role: string;

  @OneToMany(() => Village, (village) => village.user)
  villages: Village[];

  @OneToMany(() => Attack, (attack) => attack.attacker)
  attacksFrom: Village[];

  @OneToMany(() => Attack, (attack) => attack.defender)
  attacksTo: Village[];


  @Column({ default: false })
  email_confirmed: boolean;

  @Column({ type: 'timestamptz'})
  email_confirmed_at: Date;

  @Column({ type: 'timestamptz'})
  last_verification_email_sent: Date;

  @Column({})
  email_verification_token: string

  @OneToMany(() => GuildMembers, (guildUser) => guildUser.user)
  memberGuilds: GuildMembers[];
  // Avoid returning unnecessary data, and protect password's hash
  toJSON() {
    return {
      id: this.id,
      username: this.username,
    };
  }

}
