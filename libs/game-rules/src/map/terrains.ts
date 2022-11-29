export enum TERRAIN_RESOURCES {
  CROPLANDS = 'croplands',
  FOREST = 'forest',
  SWAMP = 'swamp',
  MINES = 'mines',
  HILLS = 'hills',
  PLAINS = 'plains',
  WATER = 'water',
  MOUNTAIN = 'mountain',
}

export const passableTerrainResourcesList: ReadonlyArray<TERRAIN_RESOURCES> = [
  TERRAIN_RESOURCES.CROPLANDS,
  TERRAIN_RESOURCES.FOREST,
  TERRAIN_RESOURCES.SWAMP,
  TERRAIN_RESOURCES.MINES,
  TERRAIN_RESOURCES.HILLS,
  TERRAIN_RESOURCES.PLAINS,
];
