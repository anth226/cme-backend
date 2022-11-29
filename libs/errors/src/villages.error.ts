import { HttpException, HttpStatus } from '@nestjs/common';

export const ERROR_VILLAGE_NOT_FOUND = new HttpException(
  'VILLAGE_NOT_FOUND',
  HttpStatus.NOT_FOUND,
);

export const ERROR_VILLAGE_NOT_ENOUGH_RESOURCES = new HttpException(
  'ERROR_VILLAGE_NOT_ENOUGH_RESOURCES',
  HttpStatus.BAD_REQUEST,
);
