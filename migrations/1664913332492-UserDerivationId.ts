import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDerivationId1664913332492 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users
        ADD COLUMN derivation_id varchar(255) UNIQUE,
        DROP COLUMN derive`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users,
        DROP COLUMN derivation_id,
        ADD COLUMN derive int DEFAULT NULL`);
  }
}
