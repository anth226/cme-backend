import { MigrationInterface, QueryRunner } from 'typeorm';
import * as Promise from 'bluebird';

const DB_FACILITY_TYPE_RESOURCE_TYPES = 'facility_types_resource_types';
const DB_FACILITY_TYPE = 'facility_types';
const DB_INDUSTRY = 'industries';
const DB_RESOURCE_TYPES = 'resource_types';
const DB_FACILITIES = 'facilities';
const DB_VILLAGES_STORAGE_RESOURCE_TYPES = 'villages_storage_resource_types';

const STORAGE_VAULT_FACILITY_TYPE = 'storage_vault';
const STORAGE_VAULT_RESOURCE_TYPE = 'mkc';

export class AddVaultStorage1668429097657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [{ id: industry_id }] = await queryRunner.query(
      `SELECT id FROM ${DB_INDUSTRY} where name = 'cryptocurrency'`,
    );
    const [
      { id: facility_id },
    ] = await queryRunner.query(`INSERT INTO ${DB_FACILITY_TYPE} (type, industry, parameters) VALUES
        ('${STORAGE_VAULT_FACILITY_TYPE}', ${industry_id}, NULL) RETURNING id;`);

    const resolveResourceType = async (type) => {
      const [{ id: resource_id }] = await queryRunner.query(
        `SELECT id FROM ${DB_RESOURCE_TYPES} where type = '${type}'`,
      );

      return resource_id;
    };

    const resource_id = await resolveResourceType(STORAGE_VAULT_RESOURCE_TYPE);

    await queryRunner.query(`INSERT INTO ${DB_FACILITY_TYPE_RESOURCE_TYPES} (facility_type_id, resource_type_id) VALUES
                            (${facility_id}, ${resource_id})`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS ${DB_VILLAGES_STORAGE_RESOURCE_TYPES} (
                                id serial PRIMARY KEY,
                                facility_id int NOT NULL REFERENCES ${DB_FACILITIES} (id),
                                resource_type_id int NOT NULL REFERENCES ${DB_RESOURCE_TYPES} (id),
                                count int NOT NULL,
                                created_at timestamptz NOT NULL DEFAULT NOW(),
                                updated_at timestamptz NOT NULL DEFAULT NOW()
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ id: facility_id }] = await queryRunner.query(
      `SELECT id FROM ${DB_FACILITY_TYPE} WHERE type = '${STORAGE_VAULT_FACILITY_TYPE}'`,
    );

    await queryRunner.query(
      `DELETE FROM ${DB_FACILITY_TYPE_RESOURCE_TYPES} WHERE facility_type_id = ${facility_id}`,
    );

    await queryRunner.query(
      `DELETE FROM ${DB_FACILITY_TYPE} WHERE id = ${facility_id}`,
    );

    await queryRunner.query(`DROP TABLE ${DB_VILLAGES_STORAGE_RESOURCE_TYPES}`);
  }
}
