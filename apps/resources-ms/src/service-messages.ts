import { CreateFacilityDto } from 'apps/cme-backend/src/facilities/dto/create-facility.dto';
import { CreateOrderDto } from 'apps/cme-backend/src/orders/dto/create-order.dto';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';
import { Village } from 'apps/cme-backend/src/villages/village.entity';

export const ResourcesMicroServiceName = 'RESOURCES_MS';

export const ResourcesMicroServiceMessages = {
  TEST_SERVICE: `${ResourcesMicroServiceName}test_service`,
  CREATE_FACILITY: `${ResourcesMicroServiceName}_create_facility`,
  UPGRADE_FACILITY: `${ResourcesMicroServiceName}_upgrade_facility`,
  FIND_FACILITY: `${ResourcesMicroServiceName}_find_facility`,
  GET_VILLAGE_FACILITIES: `${ResourcesMicroServiceName}_get_village_facilities`,
  REMOVE_FACILITY: `${ResourcesMicroServiceName}_remove_facility`,
  CREATE_ORDER: `${ResourcesMicroServiceName}_create_order`,
  FORMAT_VILLAGE_RESOURCES: `${ResourcesMicroServiceName}_format_village_resources`,
  MERGE_UNIT_RULES: `${ResourcesMicroServiceName}_merge_unit_rules`,
  EXCHANGE_RESOURCES_OWN_VILLAGES: `${ResourcesMicroServiceName}_exchange_resources_own_villages`,
  EXCHANGE_MILITARY_RESOURCES_OWN_VILLAGES: `${ResourcesMicroServiceName}_exchange_military_resources_own_villages`,
};

export type FindFacilityMsReq = Readonly<{
  facilityId: number;
  userId: number;
}>;

export type UpgradeFacilityMsReq = Readonly<{
  facilityId: number;
  userId: number;
}>;

export type CreateFacilityMsReq = CreateFacilityDto;

export type FindFacilitiesForVillageMsReq = Readonly<{
  villageId: number;
}>;

export type RemoveFacilityMsReq = Readonly<{
  facilityId: number;
}>;

export type CreateOrderMsReq = CreateOrderDto;

export type FormatVillageResourcesMsReq = Village;

export type ExchangeResBetweenOwnVillageMsReq = Readonly<{
  senderVillageId: number;
  receiverVillageId: number;
  sentResources: Array<{
    type: string;
    count: number;
  }>;
  userId: number;
}>;

export type ExchangeMilitaryResBetweenOwnVillageMsReq = Readonly<{
  senderVillageId: number;
  receiverVillageId: number;
  sentResources: Array<{
    type: string;
    count: number;
  }>;
  userId: number;
}>;
