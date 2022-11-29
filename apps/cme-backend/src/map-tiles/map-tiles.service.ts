import { passableTerrainResourcesList } from '@app/game-rules';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { Between, getManager, Repository } from 'typeorm';
import { ResourceType } from '../resource-types/resource-type.entity';
import { Village } from '../villages/village.entity';

import { CreateMapTileDto } from './dto/create-map-tile.dto';
import { MapTile, MapTileType } from './map-tile.entity';

@Injectable()
export class MapTilesService {
  constructor(
    @InjectRepository(MapTile)
    private mapTilesRepository: Repository<MapTile>,
    @InjectRepository(Village)
    private villageRepository: Repository<Village>,
    @InjectRepository(ResourceType)
    private resourceTypeRepository: Repository<ResourceType>,
  ) {}

  findAll(): Promise<Array<MapTile>> {
    return this.mapTilesRepository.find();
  }

  findAllAround(x: number, y: number, offset: number): Promise<Array<MapTile>> {
    let x_min = x - offset;
    if (x_min < 0) {
      x_min = 0;
    }

    let y_min = y - offset;
    if (y_min < 0) {
      y_min = 0;
    }

    return this.mapTilesRepository.find({
      where: [
        {
          x: Between(x_min, x + offset),
          y: Between(y_min, y + offset),
        },
      ],
    });
  }

  findRectangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Promise<Array<MapTile>> {
    return this.mapTilesRepository.find({
      where: [
        {
          x: Between(x1, x2),
          y: Between(y1, y2),
        },
      ],
    });
  }

  findOne(id: string): Promise<MapTile> {
    return this.mapTilesRepository.findOne({
      where: { id },
      relations: ['village'],
    });
  }

  async create(mapTileDto: CreateMapTileDto): Promise<MapTile> {
    const overlayingMapTile = await this.mapTilesRepository.findOne({
      where: {
        x: mapTileDto.x,
        y: mapTileDto.y,
      },
    });

    if (!isEmpty(overlayingMapTile)) {
      throw new HttpException(
        `Your map tile overlays with another map tile`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if there are villages without a map tile
    const overlayingVillage = await this.villageRepository.findOne({
      where: {
        x: mapTileDto.x,
        y: mapTileDto.y,
      },
    });

    if (!isEmpty(overlayingVillage) && mapTileDto.type != MapTileType.VILLAGE) {
      throw new HttpException(
        `Your map tile overlays with a village`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let mapTile = new MapTile();

    mapTile.type = mapTileDto.type;
    mapTile.x = mapTileDto.x;
    mapTile.y = mapTileDto.y;
    mapTile.isPassable = mapTileDto.isPassable;

    await getManager().transaction(async (tx) => {
      if (mapTileDto.type == MapTileType.RESOURCE_TERRAIN) {
        mapTile.terrainResourceType = await tx
          .getRepository(ResourceType)
          .findOneOrFail({
            where: {
              type: mapTileDto.terrainResourceType,
            },
          });

        mapTile.isPassable = passableTerrainResourcesList.includes(
          mapTileDto.terrainResourceType,
        );
      }

      mapTile = await tx.getRepository(MapTile).save(mapTile);

      // If there is a village without a map tile, associate the new map tile with the village
      if (!isEmpty(overlayingVillage) && mapTile.type == MapTileType.VILLAGE) {
        overlayingVillage.mapTile = mapTile;
        mapTile.villageName = overlayingVillage.name;

        await tx.getRepository(MapTile).save(mapTile);
        await tx.getRepository(Village).save(overlayingVillage);
      }
    });

    return mapTile;
  }

  async remove(id: string): Promise<void> {
    await this.mapTilesRepository.delete(id);
  }
}
