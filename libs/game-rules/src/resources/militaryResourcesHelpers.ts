import {
  MILITARY_RESOURCES,
  MilitaryResourceUnitCharacteristics,
} from './militaryResourceTypes';
import { ResourceInfo, ResourceUnitInfo } from './mainResourcesTypes';
import { relatedUnitDescriptors } from './militaryResourcesRules';
import { militaryResourceList } from '.';

export type BasicResourceType = {
  id: number;
  type: string;
};

export const resToResTypeInfo = (
  res: BasicResourceType,
  count: number,
): ResourceInfo => ({
  unitTypeId: res.id,
  unitTypeName: res.type as undefined,
  count,
});

// Todo: add helper functions when needed, using the rules and types described.
export const isMilitaryResource = (
  resourceInfo: ResourceInfo | ResourceUnitInfo,
): boolean => {
  return (
    militaryResourceList.indexOf(
      resourceInfo.unitTypeName as MILITARY_RESOURCES,
    ) >= 0
  );
};

export const getRelatedCharacteristic = (
  unitTypeName: MILITARY_RESOURCES,
): MilitaryResourceUnitCharacteristics => {
  return relatedUnitDescriptors[unitTypeName]?.characteristics;
};

export const addCharacteristicToResource = (
  resourceInfo: ResourceInfo,
): ResourceInfo | ResourceUnitInfo => {
  if (!isMilitaryResource(resourceInfo)) {
    return resourceInfo;
  }

  return {
    ...resourceInfo,
    characteristics: getRelatedCharacteristic(
      resourceInfo.unitTypeName as MILITARY_RESOURCES,
    ),
  } as ResourceUnitInfo;
};

export const mergeRulesToList = (
  resources: Array<ResourceInfo>,
): Array<ResourceInfo | ResourceUnitInfo> => {
  return resources.map((res) => addCharacteristicToResource(res));
};
