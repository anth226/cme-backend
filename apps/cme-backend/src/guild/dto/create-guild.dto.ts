import { IsEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateGuildDto {
  @IsEmpty()
  id: number;

  @ApiProperty()
  name: string;
}
