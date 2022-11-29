import {
  ALL_FACILITIES,
  facilityTypePricesDescriptors,
  FacilityWithPrice,
  MilitaryResourceUnit,
  MILITARY_RESOURCES,
  relatedUnitDescriptors,
  RESOURCES,
  resourcesList,
} from '@app/game-rules';
import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { LeaderBoardType } from './leaderboards.util';

const MAX_LIMIT_LEADERS = 50;
const DEFAULT_LIMIT_LEADERS = 20;

export type RulesResources = Readonly<{
  baseResources: ReadonlyArray<RESOURCES>;
  militaryResources: Record<MILITARY_RESOURCES, MilitaryResourceUnit>;
}>;

export type RulesResponse = Readonly<{
  resources: RulesResources;
  facilities: Record<ALL_FACILITIES, FacilityWithPrice>;
}>;

export type VillageLeader = Readonly<{
  name: string;
  total: number;
  rank: number;
}>;

@Injectable()
export class PublicService {
  constructor(private connection: Connection) {}

  static replace(
    leaderBoardType: string,
    query: string,
    limit: number,
    period: string,
  ) {
    query = query?.replace('${limit}', limit.toString());

    let field = '';
    if (leaderBoardType == 'stealerLeaders') {
      field = 'created_at';
    } else if (leaderBoardType == 'warlikeLeaders') {
      field = 'attacks.created_at';
    } else if (leaderBoardType == 'scientistLeaders') {
      field = 'facilities.updated_at';
    }

    //Scientist not working yet

    let period_operator = '';
    if (period == 'weekly') {
      period_operator = 'week';
    } else if (period == 'monthly') {
      period_operator = 'month';
    } else if (period == 'daily') {
      period_operator = 'day';
    } else {
      query = query?.replace('${whereClause}', ' ');
    }

    if (
      leaderBoardType == 'stealerLeaders' ||
      leaderBoardType == 'warlikeLeaders' ||
      leaderBoardType == 'scientistLeaders'
    ) {
      query = query?.replace(
        '${whereClause}',
        "WHERE date_trunc('" +
          period_operator +
          "'," +
          field +
          ") = date_trunc('" +
          period_operator +
          "',CURRENT_TIMESTAMP)",
      );
    }

    return query;
  }

  async getGenericLeaderRequest(
    leaderBoardType: string,
    limit: number = DEFAULT_LIMIT_LEADERS,
    query: string,
    period: string,
  ): Promise<ReadonlyArray<VillageLeader>> {
    let rows = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const limitChecked = limit <= MAX_LIMIT_LEADERS ? limit : MAX_LIMIT_LEADERS;
    try {
      rows = await queryRunner.query(
        PublicService.replace(leaderBoardType, query, limitChecked, period),
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error(err);
    } finally {
      await queryRunner.release();
    }
    return rows;
  }

  getRules(): RulesResponse {
    return {
      resources: {
        baseResources: resourcesList,
        militaryResources: relatedUnitDescriptors,
      },
      facilities: facilityTypePricesDescriptors,
    };
  }
}
