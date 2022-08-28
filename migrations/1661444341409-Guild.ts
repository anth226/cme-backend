import { MigrationInterface, QueryRunner } from 'typeorm';
const DB_GUILDS_NAME = 'guilds';

export class Guild1661444341409 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE ${DB_GUILDS_NAME} (
                id serial PRIMARY KEY,
                created_at timestamptz NULL DEFAULT NOW(),
                updated_at timestamptz NULL DEFAULT NOW(),
                name character(250) NOT NULL DEFAULT 'guild'
            );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE guilds`);
  }
}
