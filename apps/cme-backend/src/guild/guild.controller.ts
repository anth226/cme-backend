import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateGuildDto } from './dto/create-guild.dto';
import { InviteMembersToGuildDto } from './dto/invite-members-to-guild.dto';
import { GuildService } from './guild.service';

@Controller('guild')
@ApiTags('guild')
@ApiBearerAuth()
export class GuildController {
  constructor(private guildService: GuildService) {}

  @Post()
  create(@Request() req, @Body() guild: CreateGuildDto) {
    return this.guildService.create(guild, req.user.id);
  }

  @Post('invite')
  invite(@Request() req, @Body() guildInvite: InviteMembersToGuildDto) {
    return this.guildService.invite(guildInvite, req.user.id);
  }

  @Put('leave:id')
  leave(@Request() req, @Param('id') id: string) {
    return this.guildService.leave(parseInt(id), req.user.id);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.guildService.remove(parseInt(id), req.user.id);
  }
}
