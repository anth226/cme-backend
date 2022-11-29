import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class WithdrawDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  @IsNumberString()
  amount: string;
}
