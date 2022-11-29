export type CasualtiesInfo = {
  unitTypeId: number;
  unitTypeName: string;
  count: number;
};

export type CasualtiesInfoByUnitTypeId = {
  [key: string]: CasualtiesInfo;
};
export type AttackCasualties = {
  [key: string]: {
    casualtiesInfoByUnitTypeId: CasualtiesInfoByUnitTypeId;
  };
};

export type UnitCharacteristics = {
  health: number;
  range: number;
  damage: number;
  defense: number;
  pierce_defense: number;
  speed: number;
  food_upkeep: number;
  production_time: number;
};

// replace this unitInfo + characteristics with the resources-ms one when migrating the battle manager to new ms
export type UnitInfo = {
  unitTypeId: number;
  unitTypeName: string;
  characteristics?: UnitCharacteristics;
  count?: number;
};

export type UnitInfoByType = {
  [key: string]: UnitInfo;
};

export type AttackReport = {
  attackId: number;
  travelTime: number;
  attackerVillageId: number;
  defenderVillageId: number;
  winnerVillageId: number;
  loserVillageId;
  unitsInfoByType: {
    [key: string]: UnitInfoByType;
  };
  casualties: AttackCasualties;
};

export type StolenResource = {
  id: number;
  count: number;
};

export type RedisReturningAttackData = {
  attackId: number;
  attackerUnitsInfoByType: UnitInfoByType;
  attackerCasualties: CasualtiesInfoByUnitTypeId;
  attackerVillageId: number;
  defenderVillageId: number;
  stolenResources: Array<StolenResource> | undefined;
};

export enum StakeholderStatus {
  ATTACKER = 'attacker',
  DEFENDER = 'defender',
}
