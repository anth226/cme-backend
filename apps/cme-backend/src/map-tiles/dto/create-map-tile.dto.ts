import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MapTileType } from '../map-tile.entity';
import { TERRAIN_RESOURCES } from '@app/game-rules';

export class CreateMapTileDto {
  @ApiProperty()
  @IsNumber()
  x: number;

  @ApiProperty()
  @IsNumber()
  y: number;

  @ApiProperty()
  @IsEnum(MapTileType)
  type: MapTileType;

  @ApiProperty()
  @IsOptional()
  @IsEnum(TERRAIN_RESOURCES)
  terrainResourceType?: TERRAIN_RESOURCES;

  @ApiProperty()
  @ValidateIf((dto) => dto.type == MapTileType.EMPTY)
  @IsBoolean()
  isPassable?: boolean;
}
