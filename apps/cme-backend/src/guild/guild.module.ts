import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildMembers } from '../guild-members/guild-users.entity';
import { User } from '../users/user.entity';
import { GuildController } from './guild.controller';
import { Guild } from './guild.entity';
import { GuildService } from './guild.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guild]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([GuildMembers]),
  ],
  providers: [GuildService],
  controllers: [GuildController],
})
export class GuildModule {}
