import { ALL_FACILITIES } from '../facilities';
import { RESOURCES } from '../resources';

export interface FacilityBuilding {
  facilityType: ALL_FACILITIES;
  resourceType: RESOURCES;
  maximumPerVillage: number;
  facilityPrice?: FacilityWithPrice;
}

export interface ExtendableLevel {
  facilityTypePrices: Array<FacilityTypeResPrice>;
  description: string;
}

export interface StorageLevel extends ExtendableLevel {
  maximum_storage: number;
}

export type Levels<T> = { [key: number]: T };

export interface ExtendsLevelBuilding<T extends ExtendableLevel> {
  levels: Levels<T & ExtendableLevel>;
}

export interface ExtendableLevelFacilityBuilding<T extends ExtendableLevel>
  extends FacilityBuilding,
    ExtendsLevelBuilding<T> {}

export type StorageFacilityBuilding = ExtendableLevelFacilityBuilding<StorageLevel>;

export type FacilityTypeResPrice = {
  resourcesType: RESOURCES;
  amount: number;
};

export type FacilityWithPrice = {
  facilityType: ALL_FACILITIES;
  facilityTypePrices: Array<FacilityTypeResPrice>;
};

export type RuleFacility = {
  facilityType: {
    type: ALL_FACILITIES | string;
  };
};
