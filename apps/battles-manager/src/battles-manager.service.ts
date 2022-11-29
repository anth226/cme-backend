import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import * as _ from 'lodash';

import {
  CasualtiesInfoByUnitTypeId,
  AttackReport,
  UnitInfo,
  UnitInfoByType,
  StolenResource,
  RedisReturningAttackData,
} from './types';
import { generateAttackReport } from './utils/attackReport';
import {
  allResourcesAsString,
  allUnitsAsString,
  getRelatedCharacteristic,
} from '@app/game-rules';
import { isEmpty } from 'lodash';

// TODO: when new units implemented, replace with unit.loadCapacity
const GENERIC_LOAD_CAPACITY = 60;

@Injectable()
export class BattlesManagerService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;
  private unitsInfo: Array<UnitInfo>;

  constructor(
    private connection: Connection,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();

    const unitsInfo = await this.queryRunner.query(`
      SELECT
        id as "unitTypeId",
        type as "unitTypeName"
      FROM
        resource_types
      WHERE
        type in (${allUnitsAsString})
    `);

    this.unitsInfo = unitsInfo.map((ui) => {
      return {
        ...ui,
        characteristics: getRelatedCharacteristic(ui.unitTypeName),
      };
    });
  }

  getUpdateValuesAsSql(stakeholderCasualties: CasualtiesInfoByUnitTypeId) {
    return Object.values(stakeholderCasualties).reduce(
      (acc, { unitTypeId, count }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${count})`;
      },
      '',
    );
  }

  async updateDefenderStolenResources(
    attackId,
    attackerVillageId,
    defenderVillageId,
    unitsInfoLeftByType: UnitInfoByType,
  ): Promise<Array<StolenResource>> {
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
        rt.type in (${allResourcesAsString})
      )
    `);

    const stolenResources: Array<StolenResource> = [];

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

    const stolenResourcesFormatted = this.formatStolenResources(
      stolenResources,
    );

    if (!isEmpty(stolenResources)) {
      await this.queryRunner.query(`
        UPDATE villages_resource_types AS vrt
        SET
          count = count - v.stolen_count,
          updated_at = NOW()
          FROM (values ${stolenResourcesFormatted}) AS v(resource_type_id, stolen_count)
        WHERE
          vrt.village_id = ${defenderVillageId} AND
          vrt.resource_type_id = v.resource_type_id;
      `);
    }

    await this.queryRunner.query(`
      UPDATE attacks
      SET
        stolen_resources = '${JSON.stringify({ resources: stolenResources })}'
      WHERE
        id = ${attackId};
    `);

    return stolenResources;
  }

  async giveResourcesToAttacker(
    stolenResources: Array<StolenResource>,
    attackerVillageId: number,
  ) {
    const stolenResourcesFormatted = this.formatStolenResources(
      stolenResources,
    );
    await this.queryRunner.query(`
        UPDATE villages_resource_types AS vrt
        SET
          count = count + v.stolen_count,
          updated_at = NOW()
          FROM (values ${stolenResourcesFormatted}) AS v(resource_type_id, stolen_count)
        WHERE
          vrt.village_id = ${attackerVillageId} AND
          vrt.resource_type_id = v.resource_type_id;`);
  }

  private formatStolenResources(
    stolenResources: Array<StolenResource>,
  ): string {
    return stolenResources.reduce((acc, { id, count }, i) => {
      return `${acc}${i === 0 ? '' : ','}(${id},${count})`;
    }, '');
  }

  async updateAttackerValuesAfterReturnAsSql(
    unitsInfoByType: UnitInfoByType,
    unitsInfoLeftByType: UnitInfoByType,
    attackerVillageId: number,
    attackId: number,
  ) {
    // returns a string with the following format '(unit_type_id, returned_count)'
    const attackerCasualtiesCount = Object.values(unitsInfoLeftByType).reduce(
      (acc, { unitTypeId, count: unitsLeft }, i) => {
        return `${acc}${i === 0 ? '' : ','}(${unitTypeId},${unitsLeft})`;
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

  async updateDb(attackFinalReport: AttackReport) {
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

    // Update the defender village resourced, but don't update attacker
    // resources until troops are back
    if (attackerWon) {
      const attackerUnits = unitsInfoByType[attackerVillageId];
      const stolenResources = await this.updateDefenderStolenResources(
        attackId,
        attackerVillageId,
        defenderVillageId,
        attackerUnits,
      );
      await this.redisClient
        .zadd(
          `delayed:return`,
          Date.now() + travelTime,
          JSON.stringify({
            attackId,
            attackerVillageId,
            attackerUnitsInfoByType: attackerUnits,
            attackerCasualties:
              casualties[attackerVillageId].casualtiesInfoByUnitTypeId,
            defenderVillageId,
            stolenResources: stolenResources,
            queue: 'pending:return',
          } as RedisReturningAttackData),
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
          rt.type in (${allUnitsAsString})
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

    const parsed: RedisReturningAttackData = JSON.parse(item);
    const {
      attackerVillageId,
      attackerUnitsInfoByType,
      attackerCasualties,
      attackId,
      defenderVillageId,
      stolenResources,
    } = parsed;

    const unitsInfoLeftByType = { ...attackerUnitsInfoByType };
    Object.values(attackerCasualties).forEach(
      ({ unitTypeName, count: casualtiesCount }) => {
        unitsInfoLeftByType[unitTypeName].count =
          unitsInfoLeftByType[unitTypeName].count - casualtiesCount;
      },
    );

    // Backwards compatability for attacks launched before update
    // TODO: remove after update
    if (stolenResources === undefined) {
      this.updateDefenderStolenResources(
        attackId,
        attackerVillageId,
        defenderVillageId,
        unitsInfoLeftByType,
      ).then((resources) => {
        return this.giveResourcesToAttacker(resources, attackerVillageId);
      });
    } else {
      this.giveResourcesToAttacker(stolenResources, attackerVillageId);
    }

    this.updateAttackerValuesAfterReturnAsSql(
      attackerUnitsInfoByType,
      unitsInfoLeftByType,
      attackerVillageId,
      attackId,
    );
  }
}
