import { facilityTypePricesDescriptors } from './facilityPrices';
import { ALL_FACILITIES } from './facilityTypes';
import {
  ExtendableLevel,
  ExtendableLevelFacilityBuilding,
  FacilityTypeResPrice,
} from '../types';
import { findFacilityDescriptorByType } from './facilityRules';

const computeResCost = (baseCost: number, levelRequested: number) => {
  return baseCost + (baseCost * (250 * levelRequested)) / 100;
};

export const computeBuildingCost = (
  facilityType: ALL_FACILITIES,
  levelRequested: number,
): ReadonlyArray<FacilityTypeResPrice> => {
  const facilityDescriptor = findFacilityDescriptorByType(
    facilityType,
  ) as ExtendableLevelFacilityBuilding<ExtendableLevel>;

  let baseCosts;
  if (facilityDescriptor && facilityDescriptor.levels) {
    baseCosts = facilityDescriptor.levels[levelRequested];
  } else {
    baseCosts = facilityTypePricesDescriptors[facilityType];
  }

  return (
    baseCosts?.facilityTypePrices.map((ftp) => {
      return {
        resourcesType: ftp.resourcesType,
        amount: computeResCost(ftp.amount, levelRequested),
      };
    }) || []
  );
};
