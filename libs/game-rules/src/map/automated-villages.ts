import { RESOURCES } from '../resources';

export const automatedVillageInitialResources: Readonly<
  Map<RESOURCES | string, number>
> = new Map([
  [RESOURCES.FOOD, 3000],
  [RESOURCES.IRON, 3000],
  [RESOURCES.WOOD, 3000],
  [RESOURCES.MKC, 1000],
]);

export const MAX_AUTOMATED_VILLAGES_IN_MAP_BLOCK = 5;
