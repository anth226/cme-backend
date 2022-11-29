import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomatedVillages1668699285298 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE automated_village_history (
        id serial PRIMARY KEY,
        x int NOT NULL,
        y int NOT NULL,
        is_removed boolean DEFAULT FALSE,
        village_id int REFERENCES villages NOT NULL,
        created_at timestamptz NULL DEFAULT NOW(),
        updated_at timestamptz NULL DEFAULT NOW()
    );`);

    await queryRunner.query(`CREATE TABLE map_blocks (
        id serial PRIMARY KEY,
        x1 int NOT NULL,
        y1 int NOT NULL,
        x2 int NOT NULL,
        y2 int NOT NULL,
        created_at timestamptz NULL DEFAULT NOW(),
        updated_at timestamptz NULL DEFAULT NOW()
    );`);

    await queryRunner.query(`ALTER TABLE villages
        ADD COLUMN automated boolean DEFAULT FALSE
    `);

    await queryRunner.query(`ALTER TABLE villages_resource_types
        ADD COLUMN automated_village_history_id int NULL REFERENCES automated_village_history (id),
        ALTER COLUMN village_id DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE villages_resource_types
        DROP COLUMN automated_village_history_id
    `);
    await queryRunner.query(`ALTER TABLE villages_resource_types
        DROP COLUMN automated_village_history_id,
        ALTER COLUMN village_id int SET NOT NULL
    `);
    await queryRunner.query(`DROP TABLE automated_village_history`);
    await queryRunner.query(`DROP TABLE map_blocks`);
  }
}
