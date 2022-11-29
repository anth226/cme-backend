import { MigrationInterface, QueryRunner } from 'typeorm';

const DB_FACILITY_TYPE_PRICES = 'facility_type_prices';

export class RemoveFacilityTypePrice1668134637630
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM ${DB_FACILITY_TYPE_PRICES}`);
    await queryRunner.query(`DROP TABLE ${DB_FACILITY_TYPE_PRICES}`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE ${DB_FACILITY_TYPE_PRICES} (
            id serial PRIMARY KEY,
            facility_type_id int REFERENCES facility_types (id),
            resource_type_id int REFERENCES resource_types (id),
            amount int,
            UNIQUE(facility_type_id, resource_type_id)
        );`);

    await queryRunner.query(`INSERT INTO ${DB_FACILITY_TYPE_PRICES} (facility_type_id, resource_type_id, amount) VALUES 
        (1, 2, 50), 
        (1, 3, 50), 
        (2, 1, 50), 
        (3, 1, 50), 
        (3, 2, 50), 
        (3, 3, 50),
        (4, 1, 50), 
        (4, 2, 160), 
        (4, 3, 100),
        (5, 1, 30), 
        (5, 2, 100), 
        (5, 3, 150),
        (6, 1, 150), 
        (6, 2, 260), 
        (6, 3, 80),
        (7, 1, 5), 
        (7, 2, 10), 
        (7, 3, 20),
        (8, 1, 50), 
        (8, 2, 90), 
        (8, 3, 200),
        (9, 1, 50), 
        (9, 2, 50), 
        (9, 3, 50),
        (10, 1, 400), 
        (10, 2, 30), 
        (10, 3, 40),
        (11, 1, 250),
        (11, 2, 40),
        (11, 3, 170);`);
  }
}
