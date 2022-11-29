import { ALL_FACILITIES } from './facilityTypes';
import {
  ExtendableLevel,
  ExtendableLevelFacilityBuilding,
  FacilityBuilding,
  RuleFacility,
  RuleVillage,
} from '../types';
import { facilityDescriptors } from './facilityDescriptors';
import { last } from 'lodash';
import { relatedMilitaryBuildingDescriptors } from '../resources';

export const hasMaximumFacilityTypeForVillage = (
  facilityType: ALL_FACILITIES,
  village: RuleVillage,
) => {
  const facilityRule:
    | FacilityBuilding
    | undefined = findFacilityDescriptorByType(facilityType);

  if (facilityRule) {
    const filteredFoundFacilities = village.facilities.filter(
      (e: RuleFacility) => e.facilityType.type === facilityType,
    );

    return filteredFoundFacilities.length >= facilityRule.maximumPerVillage;
  }

  return false;
};

export const findFacilityDescriptorByType = (
  type: ALL_FACILITIES,
): FacilityBuilding | undefined => {
  return facilityDescriptors.find(
    (e: FacilityBuilding) => e.facilityType === type,
  );
};

export const checkIfFacilityNextLevel = (type: string, actualTier: number) => {
  const facilityDescriptor = findFacilityDescriptorByType(
    type as ALL_FACILITIES,
  ) as ExtendableLevelFacilityBuilding<ExtendableLevel>;

  if (facilityDescriptor && facilityDescriptor.levels) {
    return Number(last(Object.keys(facilityDescriptor.levels))) > actualTier;
  } else {
    return relatedMilitaryBuildingDescriptors[type].maxTier > actualTier;
  }
};

export default {
  hasMaximumFacilityTypeForVillage,
  findFacilityDescriptorByType,
  checkIfFacilityNextLevel,
};
