import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildMembers } from './guild-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildMembers])],
})
export class GuildMembersModule {}
