import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

//Todo: USE

export class TransferResourcesToStorageResTypesDto {
  @ApiProperty({ description: 'food, wood, iron or mkc' })
  type: string;

  @ApiProperty({ description: 'the number of this resource you want to send' })
  count: number;
}

export class TransferResourcesToStorage {
  @ApiProperty()
  @IsNumber()
  facilityId: number;

  @ApiProperty()
  @IsString()
  transferType: 'WITHDRAW' | 'DEPOSIT';

  @ApiProperty()
  resource: TransferResourcesToStorageResTypesDto;
}
