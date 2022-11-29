import { RedlockService } from '@app/redlock';
import { SchedulerService } from '@app/scheduler';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { RedisService } from 'nestjs-redis';
import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { MILITARY_RESOURCES } from '@app/game-rules';

@Injectable()
export class UnitsProducerService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;

  constructor(
    private connection: Connection,
    private schedulerService: SchedulerService,
    private redisService: RedisService,
    private redlockService: RedlockService,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();
  }

  @Cron('* * * * * *')
  // TO DO: use RMQ instead of Redis lists
  // or at least use BRPOPLPUSH to limit number of redis calls and ensure some reliability
  async produce() {
    // TO DO: fetch from DB
    await Promise.mapSeries(
      [
        [MILITARY_RESOURCES.STONE_HUNTER],
        [MILITARY_RESOURCES.STONE_SLINGER],
        [MILITARY_RESOURCES.STONE_SMASHER],
        [MILITARY_RESOURCES.BERSERKER],
        [MILITARY_RESOURCES.TRIBAL_WARRIOR],
        [MILITARY_RESOURCES.TRIBAL_ARCHER],
        [MILITARY_RESOURCES.TRIBAL_BRUTE],
        [MILITARY_RESOURCES.TRIBAL_CHARGER],
        [MILITARY_RESOURCES.SWORDSMAN],
        [MILITARY_RESOURCES.ARCHER],
        [MILITARY_RESOURCES.AX_LORD],
        [MILITARY_RESOURCES.EXECUTIONER],
        [MILITARY_RESOURCES.CONSCRIPT],
        [MILITARY_RESOURCES.RIFLEMAN],
        [MILITARY_RESOURCES.HEAVY_GUNNER],
        [MILITARY_RESOURCES.ARMORED_CHARGER],
        [MILITARY_RESOURCES.MODERN_INFANTRY],
        [MILITARY_RESOURCES.SHARPSHOOTER],
        [MILITARY_RESOURCES.BLACK_OPS],
        [MILITARY_RESOURCES.DEMOLITION_UNIT],
      ],
      async (resourceType: string) => {
        const listName = `pending:${resourceType}`;
        const item = await this.redisClient.lpop(listName);
        if (!item) return;

        const parsed = JSON.parse(item);
        const {
          orderId,
          resourceTypeId,
          orderedQuantity,
          productionTime,
          villageId,
          facilityId,
          queue,
          action,
        } = parsed;

        const productionTimeAsMilliseconds = productionTime * 1000;

        const rows = await this.queryRunner.query(`
        SELECT
          orders.id,
          orders.delivered_quantity,
          orders.ordered_quantity,
          vrt.resource_type_id,
          vrt.count
        FROM orders
        LEFT JOIN villages_resource_types vrt
          ON orders.resource_type_id = vrt.resource_type_id
        WHERE
          orders.id = ${orderId} AND
          vrt.village_id = ${villageId}
      `);

        let deliveredQuantity = 0;
        let villageResourceTypeCount = null;

        if (rows.length === 1) {
          deliveredQuantity = rows[0].delivered_quantity;
          villageResourceTypeCount = rows[0].count;
        } else if (rows.length > 1) {
          throw new Error(
            'More than 1 row matching orders and villages_resource_types',
          );
        }

        if (
          (rows.length === 0 || deliveredQuantity < orderedQuantity) &&
          action === 'create'
        ) {
          await this.queryRunner.startTransaction();
          try {
            let query = `
            UPDATE orders
            SET
              delivered_quantity = delivered_quantity + 1,
              updated_at = NOW()
            WHERE
              id = ${orderId};
          `;
            if (villageResourceTypeCount == null) {
              query = `
              ${query}
              INSERT INTO villages_resource_types (village_id, resource_type_id, count)
              VALUES (${villageId}, ${resourceTypeId}, 1)
            `;
            } else {
              query = `
              ${query}
              UPDATE villages_resource_types
              SET
                count = count + 1,
                updated_at = NOW()
              WHERE
                village_id = ${villageId} AND
                resource_type_id = ${resourceTypeId}
            `;
            }
            await this.queryRunner.query(query);
            deliveredQuantity += 1;

            // Look if the facility has other units to produce.
            const isCurrentProductionContinued =
              deliveredQuantity < orderedQuantity;

            const facility = await this.facilitiesRepository.findOne({
              where: { id: facilityId },
            });

            if (!isCurrentProductionContinued) {
              // release the facility of its duties.
              await this.queryRunner.manager.getRepository(Facility).save({
                ...facility,
                isInProduction: false,
                lastProductionAt: new Date(Date.now()),
              });
            } else {
              await this.queryRunner.manager.getRepository(Facility).save({
                ...facility,
                lastProductionAt: new Date(Date.now()),
              });
            }

            await this.queryRunner.commitTransaction();

            if (isCurrentProductionContinued) {
              await this.redisClient
                .zadd(
                  `delayed:${resourceType}`,
                  Date.now() + productionTimeAsMilliseconds,
                  JSON.stringify({
                    orderId,
                    resourceTypeId,
                    orderedQuantity,
                    productionTime,
                    villageId,
                    facilityId,
                    queue,
                    action: 'create',
                  }),
                )
                .catch((e) => {
                  console.error(e);
                });
            }
          } catch (err) {
            await this.queryRunner.rollbackTransaction();
            console.error(err);
          }
        }
      },
    );
  }
}
