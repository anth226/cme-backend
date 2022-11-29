import { RESOURCES, BUILDINGS, BuildingUnit } from './resourceTypes';

/**
 * Buildings Descriptors
 */

export const croplandDescriptor: BuildingUnit = {
  name: BUILDINGS.CROPLAND,
  resource: RESOURCES.FOOD,
  unitsPerHourProduction: 10,
};

export const sawmilllandDescriptor: BuildingUnit = {
  name: BUILDINGS.SAWMILL,
  resource: RESOURCES.WOOD,
  unitsPerHourProduction: 10,
};

export const ironMinelandDescriptor: BuildingUnit = {
  name: BUILDINGS.IRON_MINE,
  resource: RESOURCES.IRON,
  unitsPerHourProduction: 10,
};

export const monkeyCoinMineDescriptor: BuildingUnit = {
  name: BUILDINGS.MONKEY_COIN_MINE,
  resource: RESOURCES.MKC,
  unitsPerHourProduction: 10,
};
