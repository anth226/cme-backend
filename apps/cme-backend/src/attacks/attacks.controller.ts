import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AttacksService } from './attacks.service';
import { CreateAttackDto } from './dto/create-attack.dto';
import { UserAttackssummaryDto } from './userSummary.util';

@ApiBearerAuth()
@Controller('attacks')
export class AttacksController {
  constructor(private readonly attacksService: AttacksService) {}

  @Post()
  create(@Body() createAttackDto: CreateAttackDto) {
    return this.attacksService.create(createAttackDto);
  }

  @Get()
  findAll() {
    return this.attacksService.findAll();
  }

  // Needs to be declared before /:id to avoid conflict.
  @Get('summary')
  summary(@Request() req): Promise<UserAttackssummaryDto> {
    return this.attacksService.userAttackssummary(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attacksService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attacksService.remove(id);
  }
}
