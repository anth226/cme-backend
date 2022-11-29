import { ALL_FACILITIES } from './facilityTypes';
import { RESOURCES } from '../resources';
import { FacilityBuilding, StorageFacilityBuilding } from '../types';

export const storageVault: StorageFacilityBuilding = {
  levels: {
    1: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 50,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 25,
        },
      ],
      description: 'Safely store 10000 MKC which cannot be looted',
      maximum_storage: 10000,
    },
    2: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 80,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 40,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 10,
        },
      ],
      description: 'Safely store 11000 MKC which cannot be looted',
      maximum_storage: 11000,
    },
    3: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 100,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 60,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 20,
        },
      ],
      description: 'Safely store 13000 MKC which cannot be looted',
      maximum_storage: 13000,
    },
    4: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 150,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 90,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 30,
        },
      ],
      description: 'Safely store 16000 MKC which cannot be looted',
      maximum_storage: 16000,
    },
    5: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 230,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 140,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 50,
        },
      ],
      description: 'Safely store 20000 MKC which cannot be looted',
      maximum_storage: 20000,
    },
    6: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 350,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 210,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 80,
        },
      ],
      description: 'Safely store 25000 MKC which cannot be looted',
      maximum_storage: 25000,
    },
    7: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 530,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 320,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 120,
        },
      ],
      description: 'Safely store 31000 MKC which cannot be looted',
      maximum_storage: 31000,
    },
    8: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 800,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 500,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 200,
        },
      ],
      description: 'Safely store 38000 MKC which cannot be looted',
      maximum_storage: 38000,
    },
    9: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 1200,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 750,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 300,
        },
      ],
      description: 'Safely store 46000 MKC which cannot be looted',
      maximum_storage: 46000,
    },
    10: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 1800,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 1130,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 450,
        },
      ],
      description: 'Safely store 55000 MKC which cannot be looted',
      maximum_storage: 55000,
    },
    11: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 2700,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 1700,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 700,
        },
      ],
      description: 'Safely store 65000 MKC which cannot be looted',
      maximum_storage: 65000,
    },
    12: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 4100,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 2600,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 1100,
        },
      ],
      description: 'Safely store 76000 MKC which cannot be looted',
      maximum_storage: 76000,
    },
    13: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 6200,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 3900,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 1700,
        },
      ],
      description: 'Safely store 88000 MKC which cannot be looted',
      maximum_storage: 88000,
    },
    14: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 9300,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 5900,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 2600,
        },
      ],
      description: 'Safely store 101000 MKC which cannot be looted',
      maximum_storage: 101000,
    },
    15: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 14000,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 8900,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 3900,
        },
      ],
      description: 'Safely store 115000 MKC which cannot be looted',
      maximum_storage: 115000,
    },
    16: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 21000,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 13000,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 6000,
        },
      ],
      description: 'Safely store 130000 MKC which cannot be looted',
      maximum_storage: 130000,
    },
    17: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 31500,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 20000,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 9000,
        },
      ],
      description: 'Safely store 146000 MKC which cannot be looted',
      maximum_storage: 146000,
    },
    18: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 47000,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 30000,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 14000,
        },
      ],
      description: 'Safely store 163000 MKC which cannot be looted',
      maximum_storage: 163000,
    },
    19: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 71000,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 45000,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 21000,
        },
      ],
      description: 'Safely store 181000 MKC which cannot be looted',
      maximum_storage: 181000,
    },
    20: {
      facilityTypePrices: [
        {
          resourcesType: RESOURCES.WOOD,
          amount: 107000,
        },
        {
          resourcesType: RESOURCES.IRON,
          amount: 70000,
        },
        {
          resourcesType: RESOURCES.MKC,
          amount: 30000,
        },
      ],
      description: 'Safely store 200000 MKC which cannot be looted',
      maximum_storage: 200000,
    },
  },
  facilityType: ALL_FACILITIES.STORAGE_VAULT,
  resourceType: RESOURCES.MKC,
  maximumPerVillage: 6,
};

export const facilityDescriptors: [FacilityBuilding] = [storageVault];
