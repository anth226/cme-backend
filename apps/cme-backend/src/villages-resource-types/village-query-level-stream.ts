import { IsInt } from 'class-validator';

export class GetVillagesRectangle {
  @IsInt()
  x1: number;

  @IsInt()
  y1: number;

  @IsInt()
  x2: number;

  @IsInt()
  y2: number;

  @IsInt()
  offset: number;
}
