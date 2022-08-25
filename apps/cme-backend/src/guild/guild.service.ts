import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { Guild } from './guild.entity';
import { GuildRepository } from './guild.repository';

@Injectable()
export class GuildService {
  constructor(
    @InjectRepository(GuildRepository)
    private readonly guildRepository: GuildRepository,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(GuildMembers)
    private guildMembersRepository: Repository<GuildMembers>,
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
    await this.usersRepository.findOneOrFail(adminId);
    if (
      guild.guildMembers.find((member) => member.user.id === adminId)
        .isAdmin !== true
    ) {
      throw new Error('You are not the admin of this guild');
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
    // find admin in guild
    const guildAdmin = guild.guildMembers.find(
      (member) => member.user.id === userId,
    );
    if (!guildAdmin.isAdmin) {
      throw new Error('You are not a member of this guild');
    }
    // if admin leaves guild, delete existing members & guild
    if (guildAdmin.isAdmin) {
      this.guildMembersRepository.delete({ guild: guild });
      this.guildRepository.remove(guild);
    }
    this.guildMembersRepository.delete(guildAdmin.id);
    return guild;
  }

  async remove(guildId: number, adminId: number): Promise<Guild> {
    const guild = await this.guildRepository.findOneOrFail(guildId, {
      relations: ['guildMembers'],
    });
    await this.usersRepository.findOneOrFail(adminId);
    // find admin in guild
    const guildAdmin = guild.guildMembers.find(
      (member) => member.user.id === adminId,
    );
    if (!guildAdmin.isAdmin) {
      throw new Error('You are not admin of this guild');
    }

    this.guildMembersRepository.delete({ guild: guild });
    this.guildRepository.remove(guild);
    return guild;
  }
}
