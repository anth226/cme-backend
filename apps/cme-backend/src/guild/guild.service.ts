import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { Guild } from './guild.entity';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(Guild)
    private readonly guildRepository: Repository<Guild>,
    @InjectRepository(GuildMembers)
    private readonly guildMembersRepository: Repository<GuildMembers>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(guild: CreateGuildDto, userId: number): Promise<Guild> {
    const newGuild = new Guild();
    newGuild.name = guild.name;
    const guildResponse = await this.guildRepository.save(newGuild);
    // add admin to guild
    const guildMembers = new GuildMembers();
    guildMembers.guild = guildResponse;
    guildMembers.user = await this.usersRepository.findOneOrFail(userId);
    guildMembers.isAdmin = true;
    await this.guildMembersRepository
      .save(guildMembers)
      .catch(() => {
        throw new Error('Error adding user to guild');
      })
      .catch(() => {
        this.guildRepository.remove(guildResponse);
        throw new Error('Error adding user to guild');
      });
    return guildResponse;
  }

  async invite(
    guildInvite: InviteMembersToGuildDto,
    adminId: number,
  ): Promise<Guild> {
    const guild = await this.guildRepository.findOneOrFail(guildInvite.id, {
      relations: ['guildMembers'],
    });
    await this.usersRepository.findOneOrFail(adminId).catch(() => {
      throw new Error('Error finding admin');
    });

    // check if user is in guild
    const user = guild.guildMembers.find(
      (guildMember) => guildMember.user.id === adminId,
    );

    if (!user || !user.isAdmin) {
      throw new Error('Only admin can invite users to guild');
    }

    const members = await this.usersRepository.findByIds(guildInvite.members);
    const tempGuildMembers = [];
    members.forEach(async (member) => {
      const guildMembers = new GuildMembers();
      guildMembers.guild = guild;
      guildMembers.user = member;
      tempGuildMembers.push(guildMembers);
    });
    await this.guildMembersRepository.save(tempGuildMembers);
    return guild;
  }

  async leave(guildId: number, userId: number): Promise<Guild> {
    const guild = await this.guildRepository.findOneOrFail(guildId, {
      relations: ['guildMembers'],
    });
    await this.usersRepository.findOneOrFail(userId);
    const user = guild.guildMembers.find((member) => member.user.id === userId);
    // check if user is in guild
    if (!user) {
      throw new Error('User is not in this guild');
    }
    // if admin leaves guild, delete existing members & guild
    if (user.isAdmin) {
      this.guildMembersRepository.delete({ guild: guild });
      this.guildRepository.remove(guild);
    } else {
      this.guildMembersRepository.remove(user);
    }
    return guild;
  }

  async remove(guildId: number, adminId: number): Promise<Guild> {
    const guild = await this.guildRepository.findOneOrFail(guildId, {
      relations: ['guildMembers'],
    });
    await this.usersRepository.findOneOrFail(adminId);
    const user = guild.guildMembers.find(
      (member) => member.user.id === adminId,
    );

    if (!user || !user.isAdmin) {
      throw new Error('You are not admin of this guild');
    }

    this.guildMembersRepository.delete({ guild: guild });
    this.guildRepository.remove(guild);
    return guild;
  }
}
