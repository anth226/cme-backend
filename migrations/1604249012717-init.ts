import {MigrationInterface, QueryRunner, Table} from 'typeorm';
import * as Promise from 'bluebird';

export class init1604249012717 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        /* await queryRunner.createTable(new Table({
            name: 'users',
            columns: [
                {

                }
            ]
        })) */
        await Promise.mapSeries([
            // TO DO: before releasing beta version, decide whether email should be required or optional
            `CREATE TABLE users (
                id serial PRIMARY KEY,
                email varchar(255) DEFAULT NULL,
                username varchar(50) NOT NULL UNIQUE,
                password char(64) NOT NULL,
                eth_wallet_addresses json,
                role varchar(255) DEFAULT NULL,
                new boolean DEFAULT TRUE,
                created_at timestamptz NOT NULL DEFAULT NOW(),
                updated_at timestamptz NOT NULL DEFAULT NOW()
            );`,
            `CREATE TABLE villages (
                id serial PRIMARY KEY,
                name varchar(255) NOT NULL UNIQUE,
                population int NOT NULL,
                x int NOT NULL,
                y int NOT NULL,
                eth_wallet_address char(42),
                created_at timestamptz NOT NULL DEFAULT NOW(),
                updated_at timestamptz NOT NULL DEFAULT NOW(),
                user_id int DEFAULT NULL REFERENCES users (id),
                UNIQUE(x, y)
            );`,
            // food, building, military, defense, research, trade
            `CREATE TABLE industries (
                id serial PRIMARY KEY,
                name varchar(25) NOT NULL UNIQUE
            );`,
            // parameters = prod_mode (auto, manual), frequence, rate_increase_per_level
            `CREATE TABLE facility_types (
                id serial PRIMARY KEY,
                type varchar(100) NOT NULL UNIQUE,
                industry int REFERENCES industries (id),
                parameters json
            );`,
            // characteristics would contain HP, Dmg etc...
            `CREATE TABLE resource_types (
                id serial PRIMARY KEY,
                type varchar(100) NOT NULL UNIQUE,
                industry int NOT NULL REFERENCES industries (id),
                characteristics json,
                evolution int REFERENCES resource_types (id),
                blueprint int REFERENCES resource_types (id)
            );`,
            // TODO polymorphic relations
            `CREATE TABLE resource_type_prices (
                id serial PRIMARY KEY,
                target_resource_type_id int REFERENCES resource_types (id),
                source_resource_type_id int REFERENCES resource_types (id),
                amount int,
                UNIQUE(target_resource_type_id, source_resource_type_id)
            );`,
            `CREATE TABLE facility_type_prices (
                id serial PRIMARY KEY,
                facility_type_id int REFERENCES facility_types (id),
                resource_type_id int REFERENCES resource_types (id),
                amount int,
                UNIQUE(facility_type_id, resource_type_id)
            );`,
            // resource_type_id ==> polymorphic if resource_types splitted in multiple tables?
            // what about blueprints ?
            `CREATE TABLE facility_types_resource_types (
                id serial PRIMARY KEY,
                facility_type_id int NOT NULL REFERENCES facility_types,
                resource_type_id int NOT NULL REFERENCES resource_types,
                level int,
                level_cost int
            );`,
            `CREATE TABLE facilities (
                id serial PRIMARY KEY,
                facility_type_id int NOT NULL REFERENCES facility_types (id),
                level int NOT NULL,
                location int NOT NULL,
                last_production_at timestamptz,
                created_at timestamptz NOT NULL DEFAULT NOW(),
                updated_at timestamptz NOT NULL DEFAULT NOW(),
                village_id int NOT NULL REFERENCES villages (id),
                UNIQUE(village_id, location)
            );`,
            `CREATE TABLE villages_resource_types (
                id serial PRIMARY KEY,
                village_id int NOT NULL REFERENCES villages (id),
                resource_type_id int NOT NULL REFERENCES resource_types (id),
                count int NOT NULL,
                created_at timestamptz NOT NULL DEFAULT NOW(),
                updated_at timestamptz NOT NULL DEFAULT NOW()
            );`,
            `CREATE TABLE orders (
                id serial PRIMARY KEY,
                facility_id int NOT NULL REFERENCES facilities (id),
                resource_type_id int NOT NULL REFERENCES resource_types (id),
                ordered_quantity int NOT NULL,
                delivered_quantity int NOT NULL DEFAULT 0,
                created_at timestamptz NOT NULL DEFAULT NOW(),
                updated_at timestamptz NOT NULL DEFAULT NOW()
            );`,
        ], (query) => queryRunner.query(query));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await Promise.mapSeries([
            'orders',
            'villages_resource_types',
            'facility_types_resource_types',
            'facility_type_prices',
            'resource_type_prices',
            'facilities',
            'resource_types',
            'facility_types',
            'industries',
            'villages',
            'users',
        ], (table) => queryRunner.dropTable(table));
    }

}
