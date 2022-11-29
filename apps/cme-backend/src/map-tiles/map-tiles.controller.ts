import { ApiBearerAuth } from '@nestjs/swagger';
import { InjectRolesBuilder, RolesBuilder } from 'nest-access-control';
import { GetVillagesRectangle } from '../villages-resource-types/village-query-level-stream';
import { CreateMapTileDto } from './dto/create-map-tile.dto';
import { MapTile } from './map-tile.entity';
import { MapTilesService } from './map-tiles.service';

import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { isEmpty } from 'lodash';

@ApiBearerAuth()
@Controller('map-tiles')
export class MapTilesController {
  constructor(
    private mapTileService: MapTilesService,
    @InjectRolesBuilder()
    private readonly rolesBuilder: RolesBuilder,
  ) {}

  @Get()
  async index(
    @Request() req,
    @Query() queryParams: GetVillagesRectangle,
  ): Promise<Array<MapTile>> {
    const permission = this.rolesBuilder.can(req.user.roles).readAny('mapTile');

    if (queryParams.x1 && queryParams.y1 && queryParams.x2 && queryParams.y2) {
      return permission.filter(
        await this.mapTileService.findRectangle(
          queryParams.x1,
          queryParams.y1,
          queryParams.x2,
          queryParams.y2,
        ),
      );
    } else if (queryParams.x1 && queryParams.y1 && queryParams.offset) {
      return permission.filter(
        await this.mapTileService.findAllAround(
          queryParams.x1,
          queryParams.y1,
          queryParams.offset,
        ),
      );
    } else {
      return permission.filter(await this.mapTileService.findAll());
    }
  }

  @Get(':id')
  async show(@Request() req, @Param('id') id: string) {
    const mapTile = await this.mapTileService.findOne(id);
    if (isEmpty(mapTile)) {
      throw new HttpException('MapTile not found', HttpStatus.NOT_FOUND);
    }

    const permission = this.rolesBuilder.can(req.user.roles).readAny('mapTile');
    return permission.filter(mapTile);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Request() req, @Body() mapTile: CreateMapTileDto) {
    const permission = this.rolesBuilder
      .can(req.user.roles)
      .createAny('mapTile');

    if (!permission.granted) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.mapTileService.create(mapTile);
  }
}
