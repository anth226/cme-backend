import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsNumber, IsString } from 'class-validator';
import { Facility } from '../../facilities/facility.entity';
import { Exclude } from 'class-transformer';
import { ResourceType } from '../../resource-types/resource-type.entity';
import { MILITARY_RESOURCES } from '@app/game-rules';

export class CreateOrderDto {
  @IsEmpty()
  id: number;

  @Exclude()
  readonly deliveredQuantity: number = 0;

  @Exclude()
  resourceType: ResourceType;

  @Exclude()
  facility: Partial<Facility>;

  @ApiProperty()
  @IsNumber()
  facilityId: number;

  @ApiProperty()
  @IsNumber()
  orderedQuantity: number;

  @ApiProperty({
    enum: MILITARY_RESOURCES,
  })
  @IsString()
  unitName: string;
}
