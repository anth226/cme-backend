// Todo: add helper functions when needed, using the rules and types described.

import { BUILDINGS } from './resourceTypes';
import { findFacilityDescriptorByType } from '../facilities/facilityRules';
import { ALL_FACILITIES } from '../facilities';
import { ExtendableLevel, ExtendableLevelFacilityBuilding } from '../types';

export type typesOfBuildings =
  | 'building'
  | 'militaryBuilding'
  | 'levelableBuilding';

export const findBuildingType = (type: string): typesOfBuildings => {
  const facilityDescriptor = findFacilityDescriptorByType(
    type as ALL_FACILITIES,
  ) as ExtendableLevelFacilityBuilding<ExtendableLevel>;

  if (facilityDescriptor && facilityDescriptor.levels) {
    return 'levelableBuilding';
  }

  if ((<any>Object).values(BUILDINGS).includes(type)) {
    return 'building';
  }

  return 'militaryBuilding';
};
