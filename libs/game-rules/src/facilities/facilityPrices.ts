import { RESOURCES } from '../resources';
import { ALL_FACILITIES } from './facilityTypes';
import { FacilityWithPrice } from '../types';

export const croplandPrices: FacilityWithPrice = {
  facilityType: ALL_FACILITIES.CROPLAND,
  facilityTypePrices: [
    {
      resourcesType: RESOURCES.IRON,
      amount: 50,
    },
    {
      resourcesType: RESOURCES.WOOD,
      amount: 50,
    },
  ],
};

export const ironMinePrices: FacilityWithPrice = {
  facilityType: ALL_FACILITIES.IRON_MINE,
  facilityTypePrices: [
    {
      resourcesType: RESOURCES.FOOD,
      amount: 50,
    },
  ],
};

export const sawmillPrices: FacilityWithPrice = {
  facilityType: ALL_FACILITIES.SAWMILL,
  facilityTypePrices: [
    {
      resourcesType: RESOURCES.FOOD,
      amount: 50,
    },
    {
      resourcesType: RESOURCES.IRON,
      amount: 50,
    },
    {
      resourcesType: RESOURCES.WOOD,
      amount: 50,
    },
  ],
};

export const barrackPrices: FacilityWithPrice = {
  facilityType: ALL_FACILITIES.BARRACK,
  facilityTypePrices: [
    {
      resourcesType: RESOURCES.FOOD,
      amount: 50,
    },
    {
      resourcesType: RESOURCES.IRON,
      amount: 160,
    },
    {
      resourcesType: RESOURCES.WOOD,
      amount: 100,
    },
  ],
};

export const mkcMinePrices: FacilityWithPrice = {
  facilityType: ALL_FACILITIES.MONKEY_COIN_MINE,
  facilityTypePrices: [
    {
      resourcesType: RESOURCES.FOOD,
      amount: 250,
    },
    {
      resourcesType: RESOURCES.IRON,
      amount: 40,
    },
    {
      resourcesType: RESOURCES.WOOD,
      amount: 170,
    },
  ],
};

// export const wallPrices: FacilityWithPrice = {
//   facilityType: ALL_FACILITIES.WALL,
//   facilityTypePrices: [
//     {
//       resourcesType: RESOURCES.FOOD,
//       amount: 5,
//     },
//     {
//       resourcesType: RESOURCES.IRON,
//       amount: 10,
//     },
//     {
//       resourcesType: RESOURCES.WOOD,
//       amount: 20,
//     },
//   ],
// };

// export const towerPrices: FacilityWithPrice = {
//   facilityType: ALL_FACILITIES.TOWER,
//   facilityTypePrices: [
//     {
//       resourcesType: RESOURCES.FOOD,
//       amount: 50,
//     },
//     {
//       resourcesType: RESOURCES.IRON,
//       amount: 90,
//     },
//     {
//       resourcesType: RESOURCES.WOOD,
//       amount: 200,
//     },
//   ],
// };

// export const researchCenterPrices: FacilityWithPrice = {
//   facilityType: ALL_FACILITIES.RESEARCH_CENTER,
//   facilityTypePrices: [
//     {
//       resourcesType: RESOURCES.FOOD,
//       amount: 50,
//     },
//     {
//       resourcesType: RESOURCES.IRON,
//       amount: 50,
//     },
//     {
//       resourcesType: RESOURCES.WOOD,
//       amount: 50,
//     },
//   ],
// };

// export const marketplacePrices: FacilityWithPrice = {
//   facilityType: ALL_FACILITIES.MARKETPLACE,
//   facilityTypePrices: [
//     {
//       resourcesType: RESOURCES.FOOD,
//       amount: 400,
//     },
//     {
//       resourcesType: RESOURCES.IRON,
//       amount: 30,
//     },
//     {
//       resourcesType: RESOURCES.WOOD,
//       amount: 40,
//     },
//   ],
// };

export const facilityTypePricesDescriptors: Record<
  ALL_FACILITIES,
  FacilityWithPrice
> = {
  [ALL_FACILITIES.CROPLAND]: croplandPrices,
  [ALL_FACILITIES.IRON_MINE]: ironMinePrices,
  [ALL_FACILITIES.SAWMILL]: sawmillPrices,
  [ALL_FACILITIES.BARRACK]: barrackPrices,
  [ALL_FACILITIES.MONKEY_COIN_MINE]: mkcMinePrices,
  [ALL_FACILITIES.STORAGE_VAULT]: {} as FacilityWithPrice, // todo: try to avoid that,
  // still not figured out how to avoid having STORAGE_VAULT jere as it's over written in the price utils
};
