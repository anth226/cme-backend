import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPasswordType1617707277896 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table users alter column password type varchar(255)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'alter table users alter column password type char(64)',
    );
  }
}
