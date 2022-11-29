import { HttpException, HttpStatus } from '@nestjs/common';

export const ERROR_SAVING_FACILITY = new HttpException(
  'ERROR_WHILE_SAVING_FACILITY',
  HttpStatus.BAD_REQUEST,
);

export const ERROR_UPGRADING_FACILITY = new HttpException(
  'ERROR_WHILE_UPGRADING_FACILITY',
  HttpStatus.BAD_REQUEST,
);

export const ERROR_FACILITY_NOT_FOUND = new HttpException(
  'FACILITY_NOT_FOUND',
  HttpStatus.NOT_FOUND,
);

export const ERROR_FACILITY_STORAGE_NOT_FOUND = new HttpException(
  'ERROR_FACILITY_STORAGE_NOT_FOUND',
  HttpStatus.NOT_FOUND,
);
export const ERROR_FACILITY_HAS_NO_MORE_RESOURCES = new HttpException(
  'ERROR_FACILITY_HAS_NO_MORE_RESOURCES',
  HttpStatus.BAD_REQUEST,
);
export const ERROR_FACILITY_HAS_MAXIMUM_AMOUNT_OF_RESOURCES = new HttpException(
  'ERROR_FACILITY_HAS_MAXIMUM_AMOUNT_OF_RESOURCES',
  HttpStatus.BAD_REQUEST,
);
