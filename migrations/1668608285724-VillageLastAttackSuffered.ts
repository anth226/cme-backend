import { MigrationInterface, QueryRunner } from 'typeorm';

export class VillageTruceEndsAt1668608285724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "villages" ADD COLUMN "truce_ends_at" timestamp with time zone NOT NULL DEFAULT '1970-01-01';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "villages" DROP COLUMN "truce_ends_at";`,
    );
  }
}
