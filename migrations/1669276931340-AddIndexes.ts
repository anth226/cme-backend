import { MigrationInterface, QueryRunner } from 'typeorm';

const USERS_DB = 'users';
const VILLAGES_DB = 'villages';
const VILLAGES_RESOURCE_TYPES_DB = 'villages_resource_types';
const VILLAGES_STORAGE_RESOURCE_TYPES_DB = 'villages_storage_resource_types';
const FACILITIES_DB = 'facilities';
const ATTACKS_DB = 'attacks';
const MAP_TILES_DB = 'map_tiles';
const MKC_WALLET_TRANSFER_DB = 'user_wallet_transfers';

export class AddIndexes1669276931340 implements MigrationInterface {
  name = 'AddIndexes1669276931340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE index username_idx on ${USERS_DB} (username)`,
    );
    await queryRunner.query(
      `CREATE index eth_wallet_idx on ${USERS_DB} (eth_wallet_addresses)`,
    );
    await queryRunner.query(
      `CREATE index user_id_idx on ${VILLAGES_DB} (user_id)`,
    );

    await queryRunner.query(
      `CREATE index last_production_at_idx on ${FACILITIES_DB} (last_production_at)`,
    );
    await queryRunner.query(
      `CREATE index created_at_idx on ${FACILITIES_DB} (created_at)`,
    );

    await queryRunner.query(
      `CREATE index attacker_idx on ${ATTACKS_DB} (attacker_id)`,
    );
    await queryRunner.query(
      `CREATE index attacker_is_under_attack_idx on ${ATTACKS_DB} (attacker_id, is_under_attack)`,
    );
    await queryRunner.query(
      `CREATE index defender_idx on ${ATTACKS_DB} (defender_id)`,
    );
    await queryRunner.query(
      `CREATE index defender_is_under_attack_idx on ${ATTACKS_DB} (defender_id, is_under_attack)`,
    );
    await queryRunner.query(
      `CREATE index is_under_attack_idx on ${ATTACKS_DB} (is_under_attack)`,
    );
    await queryRunner.query(
      `CREATE index defender_village_id_idx on ${ATTACKS_DB} (defender_village_id)`,
    );
    await queryRunner.query(
      `CREATE index defender_village_id_is_under_attack_idx on ${ATTACKS_DB} (defender_village_id, is_under_attack)`,
    );

    await queryRunner.query(`CREATE index x_y_idx on ${MAP_TILES_DB} (x, y)`);

    await queryRunner.query(
      `CREATE index village_id_idx on ${VILLAGES_RESOURCE_TYPES_DB} (village_id)`,
    );
    await queryRunner.query(
      `CREATE index resource_type_id_idx on ${VILLAGES_RESOURCE_TYPES_DB} (resource_type_id)`,
    );
    await queryRunner.query(
      `CREATE index village_id_resource_type_id_idx on ${VILLAGES_RESOURCE_TYPES_DB} (resource_type_id, village_id)`,
    );

    await queryRunner.query(
      `CREATE index facility_id_idx on ${VILLAGES_STORAGE_RESOURCE_TYPES_DB} (facility_id)`,
    );

    await queryRunner.query(
      `CREATE index status_idx on ${MKC_WALLET_TRANSFER_DB} (status)`,
    );
    await queryRunner.query(
      `CREATE index type_idx on ${MKC_WALLET_TRANSFER_DB} (type)`,
    );
    await queryRunner.query(
      `CREATE index status_type_idx on ${MKC_WALLET_TRANSFER_DB} (status, type)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP index username_idx on ${USERS_DB}`);
    await queryRunner.query(`DROP index eth_wallet_idx on ${USERS_DB}`);
    await queryRunner.query(`DROP index user_id_idx on ${VILLAGES_DB}`);
    await queryRunner.query(
      `DROP index last_production_at_idx on ${FACILITIES_DB}`,
    );
    await queryRunner.query(`DROP index created_at_idx on ${FACILITIES_DB}`);
    await queryRunner.query(`DROP index attacker_idx on ${ATTACKS_DB}`);
    await queryRunner.query(`DROP index defender_idx on ${ATTACKS_DB}`);
    await queryRunner.query(
      `DROP index attacker_is_under_attack_idx on ${ATTACKS_DB}`,
    );
    await queryRunner.query(
      `DROP index defender_is_under_attack_idx on ${ATTACKS_DB}`,
    );
    await queryRunner.query(
      `DROP index defender_village_id_idx on ${ATTACKS_DB}`,
    );
    await queryRunner.query(
      `DROP index defender_village_id_is_under_attack_idx on ${ATTACKS_DB}`,
    );
    await queryRunner.query(`DROP index is_under_attack_idx on ${ATTACKS_DB}`);
    await queryRunner.query(`DROP index x_y_idx on ${MAP_TILES_DB}`);
    await queryRunner.query(
      `DROP index village_id_idx on ${VILLAGES_RESOURCE_TYPES_DB}`,
    );
    await queryRunner.query(
      `DROP index resource_type_id_idx on ${VILLAGES_RESOURCE_TYPES_DB}`,
    );
    await queryRunner.query(
      `DROP index village_id_resource_type_id_idx on ${VILLAGES_RESOURCE_TYPES_DB}`,
    );
    await queryRunner.query(
      `DROP index facility_id_idx on ${VILLAGES_STORAGE_RESOURCE_TYPES_DB}`,
    );
    await queryRunner.query(
      `DROP index status_idx on ${MKC_WALLET_TRANSFER_DB}`,
    );
    await queryRunner.query(`DROP index type_idx on ${MKC_WALLET_TRANSFER_DB}`);
    await queryRunner.query(
      `DROP index status_type_idx on ${MKC_WALLET_TRANSFER_DB}`,
    );
  }
}
