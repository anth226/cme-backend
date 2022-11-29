/**
 * Basic resources
 */

export enum BASE_RESOURCES {
  FOOD = 'food',
  WOOD = 'wood',
  IRON = 'iron',
}

export enum CURRENCY_RESOURCES {
  MKC = 'mkc',
}

export enum RESOURCES {
  FOOD = BASE_RESOURCES.FOOD,
  WOOD = BASE_RESOURCES.WOOD,
  IRON = BASE_RESOURCES.IRON,
  MKC = CURRENCY_RESOURCES.MKC,
}

export const resourcesList: ReadonlyArray<RESOURCES> = [
  RESOURCES.FOOD,
  RESOURCES.WOOD,
  RESOURCES.IRON,
  RESOURCES.MKC,
];

export const allResourcesAsString = `'${RESOURCES.FOOD}', '${RESOURCES.WOOD}', '${RESOURCES.IRON}', '${RESOURCES.MKC}'`;

/**
 * Basic buildings
 */

export enum BUILDINGS {
  CROPLAND = 'cropland',
  SAWMILL = 'sawmill',
  IRON_MINE = 'iron_mine',
  MONKEY_COIN_MINE = 'mkc_mine',
}

export const buildingList: ReadonlyArray<BUILDINGS> = [
  BUILDINGS.CROPLAND,
  BUILDINGS.SAWMILL,
  BUILDINGS.IRON_MINE,
  BUILDINGS.MONKEY_COIN_MINE,
];

export type BuildingUnit = Readonly<{
  name: BUILDINGS;
  resource: RESOURCES;
  unitsPerHourProduction: number;
}>;
