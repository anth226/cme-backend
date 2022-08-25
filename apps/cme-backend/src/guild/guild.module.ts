import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildMembersRepository } from '../guild-members/guild-users.repository';
import { UserRepository } from '../users/user.repository';
import { GuildController } from './guild.controller';
import { GuildRepository } from './guild.repository';
import { GuildService } from './guild.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GuildRepository,
      UserRepository,
      GuildMembersRepository,
    ]),
  ],
  providers: [GuildService],
  controllers: [GuildController],
})
export class GuildModule {}
