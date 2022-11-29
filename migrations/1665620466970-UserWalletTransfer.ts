import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserWalletTransfer1665620466970 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE user_wallet_transfers (
        id serial PRIMARY KEY,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        user_id int DEFAULT NULL REFERENCES users (id),
        type varchar(50) NOT NULL,
        retries int DEFAULT 0,
        status varchar(50) NOT NULL DEFAULT 'PENDING',
        transaction_hash varchar(66) UNIQUE,
        source_transaction_hash varchar(66) UNIQUE,
        mkc_amount decimal NOT NULL,
        mkc_amount_without_fee decimal NOT NULL,
        mkc_fee decimal NOT NULL,
        external_wallet_address varchar(42)
        );`);

    await queryRunner.query(`ALTER TABLE user_mkc_wallets
        ADD COLUMN balance_pending_withdrawal decimal
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_wallet_transfers`);
    await queryRunner.query(`ALTER TABLE user_mkc_wallets
        DROP COLUMN balance_pending_withdrawal
    `);
  }
}
