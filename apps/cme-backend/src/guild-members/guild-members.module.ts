import { Module } from '@nestjs/common';
import { GuildMembersService } from './guild-members.service';
import { GuildMembersController } from './guild-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuildMembers } from './guild-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuildMembers])],
  providers: [GuildMembersService],
  controllers: [GuildMembersController],
  exports: [GuildMembersService],
})
export class GuildMembersModule {}
