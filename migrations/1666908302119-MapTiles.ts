import { MigrationInterface, QueryRunner } from 'typeorm';

export class MapTiles1666908302119 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [terrainIndustry] = await queryRunner.query(
      `INSERT INTO industries (name) VALUES ('terrain') RETURNING id`,
    );

    await queryRunner.query(`INSERT INTO resource_types (type, industry, characteristics, evolution) VALUES
        ('croplands', ${terrainIndustry.id}, NULL, NULL),
        ('forest', ${terrainIndustry.id}, NULL, NULL),
        ('swamp', ${terrainIndustry.id}, NULL, NULL),
        ('mines', ${terrainIndustry.id}, NULL, NULL),
        ('hills', ${terrainIndustry.id}, NULL, NULL),
        ('plains', ${terrainIndustry.id}, NULL, NULL),
        ('water', ${terrainIndustry.id}, NULL, NULL),
        ('mountain', ${terrainIndustry.id}, NULL, NULL)
    `);

    await queryRunner.query(
      `CREATE TYPE map_tile_type AS ENUM('village', 'resource_terrain', 'empty')`,
    );

    await queryRunner.query(`CREATE TABLE map_tiles (
        id serial PRIMARY KEY,
        x int NOT NULL,
        y int NOT NULL,
        type map_tile_type NOT NULL,
        resource_type_id int REFERENCES resource_types NULL,
        village_name varchar(255) NULL,
        is_passable boolean NULL,
        village_id int REFERENCES villages NULL,
        created_at timestamptz NULL DEFAULT NOW(),
        updated_at timestamptz NULL DEFAULT NOW()
    );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM industries WHERE id = 9`);
    await queryRunner.query(`DELETE FROM resource_types WHERE industry = 9`);
    await queryRunner.query(`DROP TYPE map_tile_type`);
    await queryRunner.query(`DROP TABLE map_tiles`);
  }
}
