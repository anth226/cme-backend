import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillagesController } from './villages.controller';
import { VillagesService } from './villages.service';
import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { AccessControlModule } from 'nest-access-control';
import { roles } from '../app.roles';
import { Facility } from '../facilities/facility.entity';
import { FacilityType } from '../facility-types/facility-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { MapTile } from '../map-tiles/map-tile.entity';
import { Attack } from '../attacks/attack.entity';
import { AutomatedVillageHistory } from '../automated-village-history/automated-village-history.entity';
import { MapBlock } from '../map-tiles/map-block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Village]),
    TypeOrmModule.forFeature([Attack]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Facility]),
    TypeOrmModule.forFeature([FacilityType]),
    TypeOrmModule.forFeature([VillageResourceType]),
    TypeOrmModule.forFeature([MapTile]),
    TypeOrmModule.forFeature([MapBlock]),
    TypeOrmModule.forFeature([AutomatedVillageHistory]),
    AccessControlModule.forRoles(roles),
  ],
  controllers: [VillagesController],
  providers: [VillagesService],
})
export class VillagesModule {}
