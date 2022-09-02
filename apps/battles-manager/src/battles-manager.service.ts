import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import * as _ from 'lodash';

import {
  casualtiesInfoByUnitTypeId,
  attackReport,
  unitInfo,
  unitInfoByType,
} from './types';
import { generateAttackReport } from './utils/attackReport';

// TODO: when new units implemented, replace with unit.loadCapacity
const GENERIC_LOAD_CAPACITY = 60;

@Injectable()
export class BattlesManagerService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;
  private unitsInfo: unitInfo[];

  constructor(
    private connection: Connection,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();

    this.unitsInfo = await this.queryRunner.query(`
      SELECT
        id as "unitTypeId",
        type as "unitTypeName", 
        characteristics
      FROM
        resource_types
      WHERE
        characteristics IS NOT NULL
    `);
  }

  getUpdateValuesAsSql(stakeholderCasualties: casualtiesInfoByUnitTypeId) {
    return Object.values(stakeholderCasualties).reduce(
      (acc, { unitTypeId, unitTypeName, count }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${count})`;
      },
      '',
    );
  }

  async updateAttackerStolenResourcesAfterReturnSql(
    attackId,
    attackerVillageId,
    defenderVillageId,
    unitsInfoLeftByType,
  ) {
    const defenderResourcesInfo = await this.queryRunner.query(`
      SELECT
        vrt.resource_type_id AS "resourceTypeId",
        rt.type AS "resourceTypeName",
        vrt.count
      FROM
        villages_resource_types vrt
      JOIN resource_types rt ON vrt.resource_type_id = rt.id
      WHERE (
        vrt.village_id = ${defenderVillageId} AND
        rt.characteristics IS NULL
      )
    `);

    const stolenResources = [];

    let totalLoadCapacity = 0;

    Object.keys(unitsInfoLeftByType)?.forEach((unitName) => {
      totalLoadCapacity +=
        unitsInfoLeftByType[unitName].count * GENERIC_LOAD_CAPACITY;
    });

    const averageLoot = Math.floor(totalLoadCapacity / 4); // TODO: update to 5 when stone implemented
    const averageMKCLoot = Math.floor(averageLoot / 100);

    /**
     * stolenResources will look like:
     * [
     *  { id: 1, count: 5 },
     *  { id: 2, count: 2 },
     *  { id: 3, count: 3 },
     * ];
     */
    defenderResourcesInfo.forEach((res) => {
      if (
        ['food', 'iron', 'wood', 'mkc'].indexOf(res.resourceTypeName) !== -1
      ) {
        // Avoid looting more resources than possible.
        const logicalCount =
          res.resourceTypeName === 'mkc' ? averageMKCLoot : averageLoot;
        const finalCount = Math.min(logicalCount, res.count);

        stolenResources.push({
          id: res.resourceTypeId,
          count: finalCount,
        });
      }
    });

    const stolenResourcesFormatted = Object.values(stolenResources).reduce(
      (acc, { id, count }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${id},${count})`;
      },
      '',
    );

    await this.queryRunner.query(`
      UPDATE villages_resource_types AS vrt
      SET
        count = count + v.stolen_count,
        updated_at = NOW()
        FROM (values ${stolenResourcesFormatted}) AS v(resource_type_id, stolen_count)
      WHERE
        vrt.village_id = ${attackerVillageId} AND
        vrt.resource_type_id = v.resource_type_id;

      UPDATE villages_resource_types AS vrt
      SET
        count = count - v.stolen_count,
        updated_at = NOW()
        FROM (values ${stolenResourcesFormatted}) AS v(resource_type_id, stolen_count)
      WHERE
        vrt.village_id = ${defenderVillageId} AND
        vrt.resource_type_id = v.resource_type_id;
  
      UPDATE attacks
      SET
        stolen_resources = '${JSON.stringify({ resources: stolenResources })}'
      WHERE
        id = ${attackId};
    `);
  }

  async updateAttackerValuesAfterReturnAsSql(
    unitsInfoByType: unitInfoByType,
    casualties: casualtiesInfoByUnitTypeId,
    attackerVillageId: number,
    attackId: number,
  ) {
    // returns a string with the following format '(unit_type_id, casualties_count)'
    const attackerCasualtiesCount = Object.values(casualties).reduce(
      (acc, { unitTypeId, unitTypeName, count: casualtiesCount }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${
          unitsInfoByType[unitTypeName].count - casualtiesCount
        })`;
      },
      '',
    );

    await this.queryRunner.query(`
      UPDATE villages_resource_types AS vrt
      SET
        count = count + v.returned_count,
        updated_at = NOW()
      FROM (values ${attackerCasualtiesCount}) AS v(unit_type_id, returned_count)
      WHERE 
        vrt.village_id = ${attackerVillageId} AND
        vrt.resource_type_id = v.unit_type_id;

      UPDATE attacks
      SET
        is_troop_home = TRUE,
        attacker_won = TRUE
      WHERE
        id = ${attackId};
    `);
  }

  async updateDb(attackFinalReport: attackReport) {
    const {
      attackId,
      travelTime,
      attackerVillageId,
      defenderVillageId,
      winnerVillageId,
      unitsInfoByType,
      casualties,
    } = attackFinalReport;

    let sqlQuery = '';

    const defenderCasualtiesCount = this.getUpdateValuesAsSql(
      casualties[defenderVillageId].casualtiesInfoByUnitTypeId,
    );

    if (defenderCasualtiesCount) {
      sqlQuery =
        sqlQuery +
        `
      UPDATE villages_resource_types AS vrt
      SET
        count = count - v.casualties,
        updated_at = NOW()
      FROM (values ${defenderCasualtiesCount}) AS v(unit_type_id, casualties)
      WHERE 
        vrt.village_id = ${defenderVillageId} AND
        vrt.resource_type_id = v.unit_type_id;`;
    }

    const attackerWon = attackerVillageId === winnerVillageId;

    sqlQuery =
      sqlQuery +
      `
    UPDATE attacks
      SET
        report = '${JSON.stringify({ unitsInfoByType, casualties })}',
        is_under_attack = false,
        is_troop_home = ${attackerWon ? 'FALSE' : 'TRUE'}
      WHERE
        id = ${attackId};
    `;

    // Update the defender village resources
    await this.queryRunner.query(sqlQuery);

    // Update the attacker village resources, but only after they returned
    if (attackerWon) {
      await this.redisClient
        .zadd(
          `delayed:return`,
          Date.now() + travelTime,
          JSON.stringify({
            attackId,
            attackerVillageId,
            attackerUnitsInfoByType: unitsInfoByType[attackerVillageId],
            attackerCasualties:
              casualties[attackerVillageId].casualtiesInfoByUnitTypeId,
            defenderVillageId,
            queue: 'pending:return',
          }),
        )
        .catch((e) => {
          console.error(e);
        });
    }
  }

  @Cron('* * * * * *')
  async handle() {
    /**
     * This first part describes the attack itself
     */
    await Promise.mapSeries(
      [
        // TO DO: add raid attack
        'normal',
      ],
      async (attackType: string) => {
        const listName = `pending:${attackType}`;
        const item = await this.redisClient.lpop(listName);
        if (!item) {
          return;
        }

        const parsed = JSON.parse(item);
        const {
          attackId,
          travelTime,
          attackerVillageId,
          defenderVillageId,
          attackerUnitsInfoByType,
          // queue,
        } = parsed;

        const defenderUnitsInfo = await this.queryRunner.query(`
        SELECT
          vrt.resource_type_id AS "unitTypeId",
          rt.type AS "unitTypeName",
          vrt.count
        FROM
          villages_resource_types vrt
        JOIN resource_types rt ON vrt.resource_type_id = rt.id
        WHERE (
          vrt.village_id = ${defenderVillageId} AND
          rt.characteristics IS NOT NULL
        )
      `);

        const defenderUnitsInfoByType = _.keyBy(
          defenderUnitsInfo,
          'unitTypeName',
        );

        const report = generateAttackReport(
          attackId,
          travelTime,
          attackerVillageId,
          attackerUnitsInfoByType,
          defenderVillageId,
          defenderUnitsInfoByType,
          this.unitsInfo,
        );

        await this.updateDb(report);
      },
    );

    /**
     * This second part describes the update done when the attacker units come back (if they came back)
     */
    const pendingReturnsListName = 'pending:return';
    const item = await this.redisClient.lpop(pendingReturnsListName);
    if (!item) {
      return;
    }

    const parsed = JSON.parse(item);
    const {
      attackerVillageId,
      attackerUnitsInfoByType,
      attackerCasualties,
      attackId,
      defenderVillageId,
    } = parsed;

    const unitsInfoLeftByType = { ...attackerUnitsInfoByType };
    Object.values(attackerCasualties).forEach(
      ({ unitTypeName, count: casualtiesCount }) => {
        unitsInfoLeftByType[unitTypeName].count =
          unitsInfoLeftByType[unitTypeName].count - casualtiesCount;
      },
    );

    this.updateAttackerStolenResourcesAfterReturnSql(
      attackId,
      attackerVillageId,
      defenderVillageId,
      unitsInfoLeftByType,
    );

    this.updateAttackerValuesAfterReturnAsSql(
      attackerUnitsInfoByType,
      attackerCasualties,
      attackerVillageId,
      attackId,
    );
  }
}
