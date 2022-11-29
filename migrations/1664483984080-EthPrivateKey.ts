import { MigrationInterface, QueryRunner } from 'typeorm';

export class EthPrivateKey1664483984080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users 
        ADD COLUMN eth_private_key varchar(128) DEFAULT NULL,
        ADD COLUMN derive int DEFAULT NULL,
        ALTER COLUMN eth_wallet_addresses TYPE character varying(42)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users
        DROP COLUMN eth_private_key,
        DROP COLUMN derive,
        ALTER COLUMN eth_wallet_addresses TYPE json
    `);
  }
}
