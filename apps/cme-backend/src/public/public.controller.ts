import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
  Request,
} from '@nestjs/common';

import { IsInt, IsString } from 'class-validator';
import { Public } from '../public.decorator';
import { LeaderBoardType, LEADERS_QUERIES } from './leaderboards.util';
import { PublicService } from './public.service';

export class GetLeaders {
  @IsInt()
  limit: number;

  @IsString()
  leaderBoardType: LeaderBoardType;
}

@Controller('public')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Public()
  @Get('leaders')
  async leaders(@Request() req, @Query() queryParams: GetLeaders) {
    return await this.publicService.getGenericLeaderRequest(
      'economicLeaders',
      queryParams.limit,
      'economicLeaders',
      'none',
    );
  }

  @Public()
  @Get('leaders/generic/:leaderBoardType/:period')
  async generic(
    @Request() req,
    @Query() queryParams: GetLeaders,
    @Param('leaderBoardType') leaderBoardType: string,
    @Param('period') period: string,
  ) {
    if (leaderBoardType in LEADERS_QUERIES) {
      return await this.publicService.getGenericLeaderRequest(
        leaderBoardType,
        queryParams.limit,
        LEADERS_QUERIES[leaderBoardType],
        period,
      );
    }
    throw new HttpException(
      `BAD Request ${leaderBoardType} not valid`,
      HttpStatus.BAD_REQUEST,
    );
  }

  @Public()
  @Get('rules')
  async rules() {
    return this.publicService.getRules();
  }
}
