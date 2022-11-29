import { stoneHunterDescriptor, MILITARY_RESOURCES, RESOURCES } from '.';
import { ResourceInfo, ResourceUnitInfo } from './mainResourcesTypes';
import {
  isMilitaryResource,
  addCharacteristicToResource,
  mergeRulesToList,
} from './militaryResourcesHelpers';

const simpleResource: ResourceInfo = {
  unitTypeId: 1,
  unitTypeName: RESOURCES.FOOD,
  count: 100,
};

const simpleUnitResource: ResourceInfo = {
  unitTypeId: 1,
  unitTypeName: MILITARY_RESOURCES.STONE_HUNTER,
  count: 100,
};

const completeUnitResource: ResourceUnitInfo = {
  unitTypeId: 1,
  unitTypeName: MILITARY_RESOURCES.STONE_HUNTER,
  count: 100,
  characteristics: stoneHunterDescriptor.characteristics,
};

describe('Resources MS: military resources helpers', () => {
  describe('isMilitaryResource', () => {
    it('should return true', () => {
      expect(isMilitaryResource(simpleUnitResource)).toBe(true);
      expect(isMilitaryResource(completeUnitResource)).toBe(true);
    });

    it('should return false', () => {
      expect(isMilitaryResource(simpleResource)).toBe(false);
    });
  });

  describe('addCharacteristicToResource', () => {
    it('should return the right unit info', () => {
      expect(addCharacteristicToResource(simpleUnitResource)).toStrictEqual(
        completeUnitResource,
      );
    });

    it('should return the same resource info since not a unit', () => {
      expect(addCharacteristicToResource(simpleResource)).toStrictEqual(
        simpleResource,
      );
    });
  });

  describe('mergeRulesToList', () => {
    it('should return the right list with normal resources info and units info', () => {
      const list = [
        simpleUnitResource,
        simpleResource,
        simpleUnitResource,
        simpleResource,
      ];
      const expectedResult = [
        completeUnitResource,
        simpleResource,
        completeUnitResource,
        simpleResource,
      ];

      expect(mergeRulesToList(list)).toStrictEqual(expectedResult);
    });
  });
});
