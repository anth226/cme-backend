import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailVerification1664485830050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users 
        ADD COLUMN email_confirmed boolean DEFAULT false,
        ADD COLUMN email_confirmed_at timestamptz DEFAULT NULL,
        ADD COLUMN last_verification_email_sent timestamptz DEFAULT NULL,
        ADD COLUMN email_verification_token varchar(255) DEFAULT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users
        DROP COLUMN email_confirmed,
        DROP COLUMN email_confirmed_at,
        DROP COLUMN last_verification_email_sent,
        DROP COLUMN email_verification_token
    `);
  }
}
