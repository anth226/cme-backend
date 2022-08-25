import { MigrationInterface, QueryRunner } from 'typeorm';

export class Guild1661444341409 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "guilds" (
                "id" serial NOT NULL,
                PRIMARY KEY ("id"),
                "created_at" timestamptz NULL,
                "updated_at" timestamptz NULL,
                "guildMembers" integer NULL,
                "name" character(250) NOT NULL DEFAULT 'guild'
            );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE guilds`);
  }
}
