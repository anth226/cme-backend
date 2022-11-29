// Types as described in the DB
import {
  MILITARY_RESOURCES,
  MilitaryResourceUnitCharacteristics,
} from './militaryResourceTypes';
import { RESOURCES } from './resourceTypes';

// Base res info (normal resources OR military resources)
export type ResourceInfo = Readonly<{
  unitTypeId: number;
  unitTypeName: RESOURCES | MILITARY_RESOURCES;
  count: number;
}>;

export type ResourceUnitInfo = ResourceInfo &
  Readonly<{
    unitTypeName: MILITARY_RESOURCES; // Override to only military resources.
    characteristics: MilitaryResourceUnitCharacteristics;
  }>;
