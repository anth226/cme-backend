import { IsEmpty, IsNumber, IsString } from 'class-validator';
import { Facility } from '../../facilities/facility.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class CreateVillageDto {
  @IsEmpty()
  id: number;
  @IsEmpty()
  facilities: Array<Facility>;

  @Exclude()
  readonly population: number = 0;

  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsNumber()
  x: number;
  @ApiProperty()
  @IsNumber()
  y: number;
}
