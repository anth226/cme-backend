import { IsEmpty, IsOptional, IsString } from 'class-validator';
import { Village } from '../../villages/village.entity';
import { ApiProperty } from '@nestjs/swagger';

import { IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsEmpty()
  id: number;

  @IsEmpty()
  role: string;

  @IsEmpty()
  villages: Array<Village>;

  @IsOptional()
  eth_wallet_addresses: string;

  @IsOptional()
  eth_private_key: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  derive: number;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  email_verification_token: string;

  derivation_id: string;
}
