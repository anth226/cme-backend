import { Module } from '@nestjs/common';
import { MapTilesService } from './map-tiles.service';
import { MapTilesController } from './map-tiles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapTile } from './map-tile.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { AccessControlModule } from 'nest-access-control';
import { roles } from '../app.roles';
import { Village } from '../villages/village.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MapTile]),
    TypeOrmModule.forFeature([ResourceType]),
    TypeOrmModule.forFeature([Village]),
    AccessControlModule.forRoles(roles),
  ],
  providers: [MapTilesService],
  controllers: [MapTilesController],
})
export class MapTilesModule {}
