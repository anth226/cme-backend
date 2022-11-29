import { MigrationInterface, QueryRunner } from 'typeorm';

import { relatedUnitDescriptors } from './gameRulesResourcesCopy/military';

const DB_RES_NAME = 'resource_types';
const DB_RES_PRICE_NAME = 'resource_type_prices';
const DB_VILLAGE_RES_NAME = 'villages_resource_types';
const DB_FACILITY_RES_NAME = 'facility_types_resource_types';
const DB_FACILITY_TYPES_NAME = 'facility_types';
const DB_FACILITY_TYPE_PRICES_NAME = 'facility_type_prices';
const DB_ORDERS_NAME = 'orders';
const DB_FACILITIES = 'facilities';

const generateResValues = (): string => {
  let list = '';

  Object.keys(relatedUnitDescriptors).forEach((key: string): void => {
    if (list !== '') {
      list = list + ', ';
    }

    list = list + `('${key}', 4)`;
  });

  return list;
};

const generateResPricesValues = (
  resourcesDb: ReadonlyArray<Readonly<{ id: number; type: string }>>,
): string => {
  let list = '';
  const foodId = resourcesDb.find((e) => e.type === 'food').id;
  const ironId = resourcesDb.find((e) => e.type === 'iron').id;
  const woodId = resourcesDb.find((e) => e.type === 'wood').id;

  Object.keys(relatedUnitDescriptors).forEach((key: string): void => {
    const costs = relatedUnitDescriptors[key].productionCosts;
    const targetResTypeId = resourcesDb.find((e) => e.type === key).id;

    if (list !== '') {
      list = list + ', ';
    }

    list =
      list +
      `(${targetResTypeId}, ${foodId}, ${costs.food}), (${targetResTypeId}, ${ironId}, ${costs.iron}), (${targetResTypeId}, ${woodId}, ${costs.wood})`;
  });

  return list;
};

export class NewBarracksNewUnits1663282364195 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO ${DB_RES_NAME} (type, industry) VALUES
        ${generateResValues()}
    `);

    const resources: ReadonlyArray<
      Readonly<{ id: number; type: string }>
    > = await queryRunner.query(`
      SELECT
        id,
        type
      FROM
       ${DB_RES_NAME}
    `);

    await queryRunner.query(`INSERT INTO ${DB_RES_PRICE_NAME} (target_resource_type_id, source_resource_type_id, amount) VALUES
        ${generateResPricesValues(resources)}
    `);

    const toRm = [
      'clubman',
      'maceman',
      'short_sword',
      'long_sword',
      'rock_thrower',
      'slinger',
      'shortbow',
      'spearman',
      'pikeman',
    ];

    const resToRm = resources.filter((res) => toRm.indexOf(res.type) >= 0);

    for (const res of resToRm) {
      await queryRunner.query(`DELETE FROM ${DB_VILLAGE_RES_NAME}
        WHERE resource_type_id = ${res.id}
      `);

      await queryRunner.query(`DELETE FROM ${DB_ORDERS_NAME}
        WHERE resource_type_id = ${res.id}
      `);

      await queryRunner.query(`DELETE FROM ${DB_RES_PRICE_NAME}
        WHERE target_resource_type_id = ${res.id}
      `);

      await queryRunner.query(`DELETE FROM ${DB_FACILITY_RES_NAME}
        WHERE resource_type_id = ${res.id}
      `);

      await queryRunner.query(`DELETE FROM ${DB_RES_NAME}
        WHERE type = '${res.type}'
      `);
    }

    const facilitiesToRM: ReadonlyArray<
      Readonly<{ id: number; type: string }>
    > = await queryRunner.query(`
      SELECT
        id,
        type
      FROM ${DB_FACILITY_TYPES_NAME}
      WHERE type in ('shooting_range', 'military_center')
    `);

    for (const fac of facilitiesToRM) {
      await queryRunner.query(`DELETE FROM ${DB_FACILITY_TYPE_PRICES_NAME}
        WHERE facility_type_id = ${fac.id}
      `);

      await queryRunner.query(`DELETE FROM ${DB_FACILITIES}
        WHERE facility_type_id = ${fac.id}
      `);
    }

    await queryRunner.query(`DELETE FROM ${DB_FACILITY_TYPES_NAME}
      WHERE type in ('shooting_range', 'military_center')
    `);
  }

  public async down(): Promise<void> {
    // REVERT not supported for this operation
  }
}
