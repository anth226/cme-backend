import {
  MilitaryResourceUnit,
  MILITARY_RESOURCES,
  MilitaryBuildingUnit,
  MILITARY_BUILDINGS,
  MilitaryBuildingTier,
} from './militaryResourceTypes';

/**
 * Mililitary building descriptors.
 */

const BARRACK_LEVELS = {
  1: MILITARY_RESOURCES.STONE_HUNTER,
  2: MILITARY_RESOURCES.STONE_SLINGER,
  3: MILITARY_RESOURCES.STONE_SMASHER,
  4: MILITARY_RESOURCES.BERSERKER,
  5: MILITARY_RESOURCES.TRIBAL_WARRIOR,
  6: MILITARY_RESOURCES.TRIBAL_ARCHER,
  7: MILITARY_RESOURCES.TRIBAL_BRUTE,
  8: MILITARY_RESOURCES.TRIBAL_CHARGER,
  9: MILITARY_RESOURCES.SWORDSMAN,
  10: MILITARY_RESOURCES.ARCHER,
  11: MILITARY_RESOURCES.AX_LORD,
  12: MILITARY_RESOURCES.EXECUTIONER,
  13: MILITARY_RESOURCES.CONSCRIPT,
  14: MILITARY_RESOURCES.RIFLEMAN,
  15: MILITARY_RESOURCES.HEAVY_GUNNER,
  16: MILITARY_RESOURCES.ARMORED_CHARGER,
  17: MILITARY_RESOURCES.MODERN_INFANTRY,
  18: MILITARY_RESOURCES.SHARPSHOOTER,
  19: MILITARY_RESOURCES.BLACK_OPS,
  20: MILITARY_RESOURCES.DEMOLITION_UNIT,
};

const getUnitUntilLevel = (level: number): Array<MILITARY_RESOURCES> => {
  const unitsForLevel: Array<MILITARY_RESOURCES> = [];

  for (const unitLevel of Object.keys(BARRACK_LEVELS)) {
    if (Number(unitLevel) <= level) {
      unitsForLevel.push(BARRACK_LEVELS[unitLevel]);
    }
  }

  return unitsForLevel;
};

const formatAllLevelsForBarrackDescriptor = (
  maxTier: number,
): ReadonlyArray<MilitaryBuildingTier> => {
  const tiers: Array<MilitaryBuildingTier> = [];

  for (let i = 1; i <= maxTier; i = i + 1) {
    tiers.push({
      tier: i,
      availableMilitaryResources: getUnitUntilLevel(i),
    });
  }

  return tiers;
};

export const barrackDescriptor: MilitaryBuildingUnit = {
  name: MILITARY_BUILDINGS.BARRACK,
  maxTier: 20,
  tiers: formatAllLevelsForBarrackDescriptor(20),
};

export const relatedMilitaryBuildingDescriptors: Record<
  MILITARY_BUILDINGS,
  MilitaryBuildingUnit
> = {
  [MILITARY_BUILDINGS.BARRACK]: barrackDescriptor,
};

/**
 * Barrack resources descriptors.
 */

// Stone Hunter
export const stoneHunterDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.STONE_HUNTER,
  characteristics: {
    health: 86,
    damage: 12,
    speed: 6,
    defense: 4,
    // dps: 4.80
    // load_capacity: 60
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 20,
    //stone: 15,
    wood: 0,
    iron: 0,
    mkc: 0,
  },
  productionTime: 10,
};

// Stone Slinger
export const stoneSlingerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.STONE_SLINGER,
  characteristics: {
    health: 80,
    damage: 10,
    speed: 12,
    defense: 5,
    // dps: 5.26
    // load_capacity: 40
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 20,
    wood: 0,
    // stone: 20,
    iron: 0,
    mkc: 0,
  },
  productionTime: 12,
};

// Stone Smasher
export const stoneSmasherDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.STONE_SMASHER,
  characteristics: {
    health: 90,
    damage: 18,
    speed: 4,
    defense: 6,
    // dps: 6.67
    // load_capacity: 80
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 30,
    wood: 0,
    // stone: 25,
    iron: 0,
    mkc: 0,
  },
  productionTime: 15,
};

// Berserker
export const berserkerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.BERSERKER,
  characteristics: {
    health: 100,
    damage: 20,
    speed: 2,
    defense: 5,
    // dps: 6.90
    // load_capacity: 100
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 35,
    wood: 0,
    // stone: 30,
    iron: 0,
    mkc: 0,
  },
  productionTime: 20,
};

// Tribal Warrior
export const tribalWarriorDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.TRIBAL_WARRIOR,
  characteristics: {
    health: 103,
    damage: 14,
    speed: 8,
    defense: 5,
    // dps: 5.14
    // load_capacity: 70
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 25,
    // stone: 0,
    wood: 25,
    iron: 0,
    mkc: 0,
  },
  productionTime: 20,
};

// Tribal Archer
export const tribalArcherDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.TRIBAL_ARCHER,
  characteristics: {
    health: 96,
    damage: 12,
    speed: 14,
    defense: 4,
    // dps: 4.44
    // load_capacity: 50
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 30,
    // stone: 0,
    wood: 30,
    iron: 0,
    mkc: 0,
  },
  productionTime: 24,
};

// Tribal Brute
export const tribalBruteDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.TRIBAL_BRUTE,
  characteristics: {
    health: 108,
    damage: 22,
    speed: 6,
    defense: 5,
    // dps: 8.31
    // load_capacity: 90
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 35,
    // stone: 0,
    wood: 35,
    iron: 0,
    mkc: 0,
  },
  productionTime: 28,
};

// Tribal Charger
export const tribalChargerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.TRIBAL_CHARGER,
  characteristics: {
    health: 120,
    damage: 24,
    speed: 4,
    defense: 6,
    // dps: 9.60
    // load_capacity: 110
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 40,
    // stone: 0,
    wood: 40,
    iron: 0,
    mkc: 0,
  },
  productionTime: 32,
};

// Swordsman
export const swordsmanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SWORDSMAN,
  characteristics: {
    health: 124,
    damage: 17,
    speed: 10,
    defense: 4,
    // dps: 7.20
    // load_capacity: 80
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 35,
    // stone: 0,
    wood: 17,
    iron: 17,
    mkc: 0,
  },
  productionTime: 30,
};

// Archer
export const archerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.ARCHER,
  characteristics: {
    health: 115,
    damage: 14,
    speed: 16,
    defense: 4,
    // dps: 6.26
    // load_capacity: 60
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 40,
    // stone: 0,
    wood: 20,
    iron: 20,
    mkc: 0,
  },
  productionTime: 35,
};

// Ax Lord
export const axLordDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.AX_LORD,
  characteristics: {
    health: 130,
    damage: 26,
    speed: 8,
    defense: 5,
    // dps: 11.78
    // load_capacity: 100
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 45,
    // stone: 0,
    wood: 22,
    iron: 22,
    mkc: 0,
  },
  productionTime: 40,
};

// Executioner
export const executionerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.EXECUTIONER,
  characteristics: {
    health: 144,
    damage: 29,
    speed: 6,
    defense: 6,
    // dps: 13.71
    // load_capacity: 120
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 50,
    // stone: 0,
    wood: 25,
    iron: 25,
    mkc: 0,
  },
  productionTime: 45,
};

// Conscript
export const conscriptDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.CONSCRIPT,
  characteristics: {
    health: 149,
    damage: 21,
    speed: 12,
    defense: 5,
    // dps: 10.37
    // load_capacity: 90
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 55,
    // stone: 0,
    wood: 0,
    iron: 55,
    mkc: 2,
  },
  productionTime: 50,
};

// Rifleman
export const riflemanDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.RIFLEMAN,
  characteristics: {
    health: 138,
    damage: 17,
    speed: 18,
    defense: 4,
    // dps: 9.09
    // load_capacity: 70
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 60,
    // stone: 0,
    wood: 0,
    iron: 60,
    mkc: 4,
  },
  productionTime: 70,
};

// Heavy Gunner
export const heavyGunnerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.HEAVY_GUNNER,
  characteristics: {
    health: 156,
    damage: 31,
    speed: 10,
    defense: 5,
    // dps: 17.28
    // load_capacity: 110
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 65,
    // stone: 0,
    wood: 0,
    iron: 65,
    mkc: 6,
  },
  productionTime: 90,
};

// Armored Charger
export const armoredChargerDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.ARMORED_CHARGER,
  characteristics: {
    health: 173,
    damage: 35,
    speed: 8,
    defense: 5,
    // dps: 20.33
    // load_capacity: 130
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 70,
    // stone: 0,
    wood: 0,
    iron: 70,
    mkc: 8,
  },
  productionTime: 110,
};

// Modern Infantry
export const modernInfantryDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.ARMORED_CHARGER,
  characteristics: {
    health: 178,
    damage: 25,
    speed: 14,
    defense: 5,
    // dps: 15.55
    // load_capacity: 100
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 85,
    // stone: 0,
    wood: 0,
    iron: 85,
    mkc: 4,
  },
  productionTime: 80,
};

// Sharpshooter
export const sharpshooterDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.SHARPSHOOTER,
  characteristics: {
    health: 166,
    damage: 21,
    speed: 20,
    defense: 5,
    // dps: 13.82
    // load_capacity: 80
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 90,
    // stone: 0,
    wood: 0,
    iron: 90,
    mkc: 8,
  },
  productionTime: 110,
};

// Black Ops
export const blackOpsDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.BLACK_OPS,
  characteristics: {
    health: 187,
    damage: 37,
    speed: 12,
    defense: 5,
    // dps: 26.66
    // load_capacity: 120
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 95,
    // stone: 0,
    wood: 0,
    iron: 95,
    mkc: 12,
  },
  productionTime: 140,
};

// Demolition Unit
export const demolitionUnitDescriptor: MilitaryResourceUnit = {
  name: MILITARY_RESOURCES.DEMOLITION_UNIT,
  characteristics: {
    health: 187,
    damage: 37,
    speed: 12,
    defense: 5,
    // dps: 26.66
    // load_capacity: 120
    range: 1, // Deprecated
    pierce_defense: 2, // Deprecated
    food_upkeep: 1, // Deprecated
  },
  // Todo: add Stone
  productionCosts: {
    food: 95,
    // stone: 0,
    wood: 0,
    iron: 95,
    mkc: 12,
  },
  productionTime: 140,
};

export const relatedUnitDescriptors: Record<
  MILITARY_RESOURCES,
  MilitaryResourceUnit
> = {
  // New descriptors
  [MILITARY_RESOURCES.STONE_HUNTER]: stoneHunterDescriptor,
  [MILITARY_RESOURCES.STONE_SLINGER]: stoneSlingerDescriptor,
  [MILITARY_RESOURCES.STONE_SMASHER]: stoneSmasherDescriptor,
  [MILITARY_RESOURCES.BERSERKER]: berserkerDescriptor,
  [MILITARY_RESOURCES.TRIBAL_WARRIOR]: tribalWarriorDescriptor,
  [MILITARY_RESOURCES.TRIBAL_ARCHER]: tribalArcherDescriptor,
  [MILITARY_RESOURCES.TRIBAL_BRUTE]: tribalBruteDescriptor,
  [MILITARY_RESOURCES.TRIBAL_CHARGER]: tribalChargerDescriptor,
  [MILITARY_RESOURCES.SWORDSMAN]: swordsmanDescriptor,
  [MILITARY_RESOURCES.ARCHER]: archerDescriptor,
  [MILITARY_RESOURCES.AX_LORD]: axLordDescriptor,
  [MILITARY_RESOURCES.EXECUTIONER]: executionerDescriptor,
  [MILITARY_RESOURCES.CONSCRIPT]: conscriptDescriptor,
  [MILITARY_RESOURCES.RIFLEMAN]: riflemanDescriptor,
  [MILITARY_RESOURCES.HEAVY_GUNNER]: heavyGunnerDescriptor,
  [MILITARY_RESOURCES.ARMORED_CHARGER]: armoredChargerDescriptor,
  [MILITARY_RESOURCES.MODERN_INFANTRY]: modernInfantryDescriptor,
  [MILITARY_RESOURCES.SHARPSHOOTER]: sharpshooterDescriptor,
  [MILITARY_RESOURCES.BLACK_OPS]: blackOpsDescriptor,
  [MILITARY_RESOURCES.DEMOLITION_UNIT]: demolitionUnitDescriptor,
};
