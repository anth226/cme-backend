import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExchangesResourcesOwnVillagesResTypesDto {
  @ApiProperty({ description: 'food, wood, or iron' })
  type: string;

  @ApiProperty({ description: 'the number of this resource you want to send' })
  count: number;
}

export class ExchangesMilitaryResourcesOwnVillagesResTypesDto {
  @ApiProperty()
  type: string;

  @ApiProperty({ description: 'the number of this resource you want to send' })
  count: number;
}

export class ExchangeResourcesOwnVillagesDto {
  @ApiProperty()
  @IsNumber()
  receiverVillageId: number;

  @ApiProperty({
    description: 'The list of villages resource types sent',
  })
  resourcesSent: Array<ExchangesResourcesOwnVillagesResTypesDto>;
}

export class ExchangeMilitaryResourcesOwnVillagesDto {
  @ApiProperty()
  @IsNumber()
  receiverVillageId: number;

  @ApiProperty({
    description: 'The list of military resource types sent',
  })
  resourcesSent: Array<ExchangesMilitaryResourcesOwnVillagesResTypesDto>;
}
