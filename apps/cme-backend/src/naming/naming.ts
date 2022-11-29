import { BadRequestException } from '@nestjs/common';

export const MAX_NAME_LENGTH = 15;

export function processName(name: string) {
  name = name.trim();
  if (name.length > MAX_NAME_LENGTH)
    throw new BadRequestException(
      `Name can't be longer than ${MAX_NAME_LENGTH} symbols`,
    );
  return name;
}
