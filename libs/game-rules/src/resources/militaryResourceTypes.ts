/**
 * Military resources types
 */
export enum MILITARY_RESOURCES {
  // New Barracks resources
  STONE_HUNTER = 'stone_hunter',
  STONE_SLINGER = 'stone_slinger',
  STONE_SMASHER = 'stone_smasher',
  BERSERKER = 'berserker',
  TRIBAL_WARRIOR = 'tribal_warrior',
  TRIBAL_ARCHER = 'tribal_archer',
  TRIBAL_BRUTE = 'tribal_brute',
  TRIBAL_CHARGER = 'tribal_charger',
  SWORDSMAN = 'swordsman',
  ARCHER = 'archer',
  AX_LORD = 'ax_lord',
  EXECUTIONER = 'executioner',
  CONSCRIPT = 'conscript',
  RIFLEMAN = 'rifleman',
  HEAVY_GUNNER = 'heavy_gunner',
  ARMORED_CHARGER = 'armored_charger',
  MODERN_INFANTRY = 'modern_infantry',
  SHARPSHOOTER = 'sharpshooter',
  BLACK_OPS = 'black_ops',
  DEMOLITION_UNIT = 'demolition_unit',
}

export enum RESOURCES_QUEUE {
  RECEIVER_VILLAGE_RESOURCES_UPDATE = 'receiver-village-resources:queue',
}

export const militaryResourceList: ReadonlyArray<MILITARY_RESOURCES> = [
  MILITARY_RESOURCES.STONE_HUNTER,
  MILITARY_RESOURCES.STONE_SLINGER,
  MILITARY_RESOURCES.STONE_SMASHER,
  MILITARY_RESOURCES.BERSERKER,
  MILITARY_RESOURCES.TRIBAL_WARRIOR,
  MILITARY_RESOURCES.TRIBAL_ARCHER,
  MILITARY_RESOURCES.TRIBAL_BRUTE,
  MILITARY_RESOURCES.TRIBAL_CHARGER,
  MILITARY_RESOURCES.SWORDSMAN,
  MILITARY_RESOURCES.ARCHER,
  MILITARY_RESOURCES.AX_LORD,
  MILITARY_RESOURCES.EXECUTIONER,
  MILITARY_RESOURCES.CONSCRIPT,
  MILITARY_RESOURCES.RIFLEMAN,
  MILITARY_RESOURCES.HEAVY_GUNNER,
  MILITARY_RESOURCES.ARMORED_CHARGER,
  MILITARY_RESOURCES.MODERN_INFANTRY,
  MILITARY_RESOURCES.SHARPSHOOTER,
  MILITARY_RESOURCES.BLACK_OPS,
  MILITARY_RESOURCES.DEMOLITION_UNIT,
];

export const allUnitsAsString = `'${MILITARY_RESOURCES.STONE_HUNTER}', '${MILITARY_RESOURCES.STONE_SLINGER}', '${MILITARY_RESOURCES.STONE_SMASHER}', '${MILITARY_RESOURCES.BERSERKER}', '${MILITARY_RESOURCES.TRIBAL_WARRIOR}', '${MILITARY_RESOURCES.TRIBAL_ARCHER}', '${MILITARY_RESOURCES.TRIBAL_BRUTE}', '${MILITARY_RESOURCES.TRIBAL_CHARGER}', '${MILITARY_RESOURCES.SWORDSMAN}', '${MILITARY_RESOURCES.ARCHER}', '${MILITARY_RESOURCES.AX_LORD}', '${MILITARY_RESOURCES.EXECUTIONER}', '${MILITARY_RESOURCES.CONSCRIPT}', '${MILITARY_RESOURCES.RIFLEMAN}', '${MILITARY_RESOURCES.HEAVY_GUNNER}', '${MILITARY_RESOURCES.ARMORED_CHARGER}', '${MILITARY_RESOURCES.MODERN_INFANTRY}', '${MILITARY_RESOURCES.SHARPSHOOTER}', '${MILITARY_RESOURCES.BLACK_OPS}', '${MILITARY_RESOURCES.DEMOLITION_UNIT}'`;

export type MilitaryResourceUnitCharacteristics = Readonly<{
  health: number;
  range: number;
  damage: number;
  defense: number;
  pierce_defense: number;
  speed: number;
  food_upkeep: number; // Todo: maybe delete if not needed in Front.
}>;

export type MilitaryResourceUnitProductionCosts = Readonly<{
  iron: number;
  food: number;
  wood: number;
  mkc: number;
}>;

export type MilitaryResourceUnit = Readonly<{
  name: MILITARY_RESOURCES;
  characteristics: MilitaryResourceUnitCharacteristics;
  productionCosts: MilitaryResourceUnitProductionCosts;
  productionTime: number; // In seconds
}>;

/**
 * Military buildings types
 */
export enum MILITARY_BUILDINGS {
  BARRACK = 'barrack',
}

export const militaryBuildingList: ReadonlyArray<MILITARY_BUILDINGS> = [
  MILITARY_BUILDINGS.BARRACK,
];

export type MilitaryBuildingTier = Readonly<{
  tier: number;
  availableMilitaryResources: ReadonlyArray<MILITARY_RESOURCES>;
}>;

export type MilitaryBuildingUnit = Readonly<{
  name: MILITARY_BUILDINGS;
  maxTier: number;
  tiers: ReadonlyArray<MilitaryBuildingTier>;
}>;
