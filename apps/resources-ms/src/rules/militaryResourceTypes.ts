/**
 * Military resources types
 */
export enum MILITARY_RESOURCES {
  // Barracks resources
  CLUBMAN = 'clubman',
  MACEMAN = 'maceman',
  SHORT_SWORD = 'short_sword',
  LONG_SWORD = 'long_sword',
  // Shooting Range resources
  ROCK_THROWER = 'rock_thrower',
  SLINGER = 'slinger',
  SHORT_BOW = 'short_bow',
  // Military Center resources
  SPEARMAN = 'spearman',
  PIKEMAN = 'pikeman',
}

export enum RESOURCES_QUEUE {
  RECEIVER_VILLAGE_RESOURCES_UPDATE = 'receiver-village-resources:queue',
}

export const militaryResourceList: ReadonlyArray<MILITARY_RESOURCES> = [
  MILITARY_RESOURCES.CLUBMAN,
  MILITARY_RESOURCES.MACEMAN,
  MILITARY_RESOURCES.SHORT_SWORD,
  MILITARY_RESOURCES.LONG_SWORD,
  MILITARY_RESOURCES.ROCK_THROWER,
  MILITARY_RESOURCES.SLINGER,
  MILITARY_RESOURCES.SHORT_BOW,
  MILITARY_RESOURCES.SPEARMAN,
  MILITARY_RESOURCES.PIKEMAN,
];

export type MilitaryResourceUnitCharacteristics = Readonly<{
  hp: number;
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
  SHOOTING_RANGE = 'shooting_range',
  MILITARY_CENTER = 'military_center',
}

export const militaryBuildingList: ReadonlyArray<MILITARY_BUILDINGS> = [
  MILITARY_BUILDINGS.BARRACK,
  MILITARY_BUILDINGS.SHOOTING_RANGE,
  MILITARY_BUILDINGS.MILITARY_CENTER,
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
