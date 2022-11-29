import { HttpException, HttpStatus } from '@nestjs/common';

export const ERROR_RESOURCE_NOT_FOUND = new HttpException(
  'ERROR_RESOURCE_NOT_FOUND',
  HttpStatus.NOT_FOUND,
);
