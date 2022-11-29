import * as _ from 'lodash';

import { StakeholderStatus, UnitInfo, UnitInfoByType } from '../types';

const computeCasualtiesForTeam = (
  stakeholderUnitsInfoByType: UnitInfoByType,
  casualtiesRatio: number,
) => {
  return _.mapValues(stakeholderUnitsInfoByType, (unitsInfo) => {
    const count = Math.round(unitsInfo.count * casualtiesRatio);

    return {
      ...unitsInfo,
      count: count <= unitsInfo.count ? count : unitsInfo.count,
    };
  });
};

const computePointsForTeam = (
  stakeholderUnitsInfoByType: UnitInfoByType,
  stakeholderStatus: StakeholderStatus,
  unitsInfo: Array<UnitInfo>,
): number => {
  return _.sumBy(unitsInfo, (unitInfo) => {
    if (stakeholderUnitsInfoByType[unitInfo.unitTypeName] === undefined) {
      return 0;
    }
    return (
      stakeholderUnitsInfoByType[unitInfo.unitTypeName].count *
      (stakeholderStatus === StakeholderStatus.ATTACKER
        ? unitInfo.characteristics.damage
        : unitInfo.characteristics.defense +
          unitInfo.characteristics.pierce_defense)
    );
  });
};

export const generateAttackReport = (
  attackId: number,
  travelTime: number,
  attackerVillageId: number,
  attackerUnitsInfoByType: Record<string, any>,
  defenderVillageId: number,
  defenderUnitsInfoByType: Record<string, any>,
  unitsInfo: Array<UnitInfo>,
) => {
  // Step 1: compute logical points for each team and find out who wins
  const attackerPoints = computePointsForTeam(
    attackerUnitsInfoByType,
    StakeholderStatus.ATTACKER,
    unitsInfo,
  );
  const defenderPoints = computePointsForTeam(
    defenderUnitsInfoByType,
    StakeholderStatus.DEFENDER,
    unitsInfo,
  );

  const attackerWon = attackerPoints > defenderPoints;
  const nobodyWon = attackerPoints === defenderPoints;

  // Step 2: set a base ratio for casualties
  let casualtiesBase: number;

  if (nobodyWon) {
    casualtiesBase = 1;
  } else {
    casualtiesBase = attackerWon
      ? defenderPoints / attackerPoints
      : attackerPoints / defenderPoints;
  }

  const casualtiesRatio = casualtiesBase ** (3 / 2);

  // Step 3: compute casualties for each team
  let attackerCasualties;
  let defenderCasualties;

  if (nobodyWon) {
    attackerCasualties = computeCasualtiesForTeam(attackerUnitsInfoByType, 1);
    defenderCasualties = computeCasualtiesForTeam(defenderUnitsInfoByType, 1);
  } else {
    attackerCasualties = computeCasualtiesForTeam(
      attackerUnitsInfoByType,
      attackerWon ? casualtiesRatio : 1,
    );
    defenderCasualties = computeCasualtiesForTeam(
      defenderUnitsInfoByType,
      attackerWon ? 1 : casualtiesRatio,
    );
  }

  // Step 4, format the Report
  return {
    attackId,
    travelTime,
    attackerVillageId,
    defenderVillageId,
    winnerVillageId: attackerWon ? attackerVillageId : defenderVillageId,
    loserVillageId: attackerWon ? defenderVillageId : attackerVillageId,
    unitsInfoByType: {
      [attackerVillageId]: attackerUnitsInfoByType,
      [defenderVillageId]: defenderUnitsInfoByType,
    },
    casualties: {
      [attackerVillageId]: {
        casualtiesInfoByUnitTypeId: attackerCasualties,
      },
      [defenderVillageId]: {
        casualtiesInfoByUnitTypeId: defenderCasualties,
      },
    },
  };
};
