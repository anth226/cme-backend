// This types are used only for display purpose, in the /villages/:id/resources route

export type VillageResourcesSummaryResource = Readonly<{
  name: string;
  count: number;
  id: number;
  industryId: number;
}>;

export type VillageResourcesSummaryResourceFighter = VillageResourcesSummaryResource &
  Readonly<{
    health: number;
    range: number;
    damage: number;
    defense: number;
    pierce_defense: number;
    speed: number;
    food_upkeep: number;
    production_time: number;
  }>;

export type VillageResourcesSummary = Readonly<{
  fighters: Array<VillageResourcesSummaryResourceFighter>;
  others: Array<VillageResourcesSummaryResource>;
}>;
