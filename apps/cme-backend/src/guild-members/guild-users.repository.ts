import { EntityRepository, Repository } from 'typeorm';
import { GuildMembers } from './guild-users.entity';

@EntityRepository(GuildMembers)
export class GuildMembersRepository extends Repository<GuildMembers> {}
