import { MigrationInterface, QueryRunner } from 'typeorm';

export class GuildUsers1661444366425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "guilds_users" (
                "id" serial NOT NULL,
                PRIMARY KEY ("id"),
                "created_at" timestamptz NULL DEFAULT now(),
                "updated_at" timestamptz NULL DEFAULT now(),
                "isAdmin" boolean NOT NULL DEFAULT false,
                "guild_id" integer NOT NULL REFERENCES "guilds" ("id"),
                "user_id" integer NOT NULL REFERENCES "users" ("id")
            );`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE guilds_users`);
  }
}
