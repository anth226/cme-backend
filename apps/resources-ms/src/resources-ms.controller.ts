import { Controller, HttpException, HttpStatus } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { ResourceInfo, ResourceUnitInfo, mergeRulesToList } from './rules';

import {
  CreateFacilityMsReq,
  CreateOrderMsReq,
  ExchangeMilitaryResBetweenOwnVillageMsReq,
  ExchangeResBetweenOwnVillageMsReq,
  FindFacilitiesForVillageMsReq,
  FindFacilityMsReq,
  FormatVillageResourcesMsReq,
  RemoveFacilityMsReq,
  ResourcesMicroServiceMessages,
  UpgradeFacilityMsReq,
} from './service-messages';
import { ResourcesMsOrdersService } from './services/resources-ms-orders.service';
import { ResourcesMsFacilitiesService } from './services/resources-ms-facilities.service';
import { ResourcesMsService } from './services/resources-ms.service';
import { ResourcesMsExchangesService } from './services/resources-ms-exchanges.service';

@Controller()
export class ResourcesMsController {
  constructor(
    private readonly resourcesMsFacilitiesService: ResourcesMsFacilitiesService,
    private readonly resourcesMsOrdersService: ResourcesMsOrdersService,
    private readonly resourcesMsService: ResourcesMsService,
    private readonly resourcesExchangesMsService: ResourcesMsExchangesService,
  ) {}

  /**
   * FACILITIES
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.CREATE_FACILITY })
  async createFacility(data: CreateFacilityMsReq): Promise<any> {
    return await this.resourcesMsFacilitiesService.create(data);
  }

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.UPGRADE_FACILITY })
  async upgradeFacility(data: UpgradeFacilityMsReq): Promise<any> {
    const res = await this.resourcesMsFacilitiesService.findOne(
      data.facilityId,
    );

    if (!res) {
      return new HttpException('Facility not found', HttpStatus.NOT_FOUND);
    }

    if (res.village.user.id !== data.userId) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return await this.resourcesMsFacilitiesService.upgradeFacility(res);
  }

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.FIND_FACILITY })
  async findFacilityById(data: FindFacilityMsReq): Promise<any> {
    const res = await this.resourcesMsFacilitiesService.findOne(
      data.facilityId,
    );

    if (!res) {
      return new HttpException('Facility not found', HttpStatus.NOT_FOUND);
    }

    if (res.village.user.id !== data.userId) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return res;
  }

  // TODO: check if need to check what user does the request
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.GET_VILLAGE_FACILITIES })
  async getFacilitiesForVillage(
    data: FindFacilitiesForVillageMsReq,
  ): Promise<any> {
    return await this.resourcesMsFacilitiesService.findAllForVillage(
      data.villageId,
    );
  }

  // TODO: check if need to check what user does the request
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.REMOVE_FACILITY })
  async removeFacility(data: RemoveFacilityMsReq): Promise<any> {
    return await this.resourcesMsFacilitiesService.remove(data.facilityId);
  }

  /**
   * ORDERS
   */

  @MessagePattern({ cmd: ResourcesMicroServiceMessages.CREATE_ORDER })
  async createOrder(order: CreateOrderMsReq): Promise<any> {
    return await this.resourcesMsOrdersService.create(order);
  }

  /**
   * RESOURCES
   */

  @MessagePattern({
    cmd: ResourcesMicroServiceMessages.FORMAT_VILLAGE_RESOURCES,
  })
  async formatResourcesForVillage(
    village: FormatVillageResourcesMsReq,
  ): Promise<any> {
    return this.resourcesMsService.formatVillageResources(village);
  }

  @MessagePattern({
    cmd: ResourcesMicroServiceMessages.EXCHANGE_RESOURCES_OWN_VILLAGES,
  })
  async exchangeResourcesBetweenOwnVillages(
    req: ExchangeResBetweenOwnVillageMsReq,
  ): Promise<any> {
    return this.resourcesExchangesMsService.exchangeResourcesBetweenSameUserVillages(
      req.senderVillageId,
      req.receiverVillageId,
      req.sentResources,
      req.userId,
    );
  }

  @MessagePattern({
    cmd: ResourcesMicroServiceMessages.EXCHANGE_MILITARY_RESOURCES_OWN_VILLAGES,
  })
  async exchangeMilitaryResourcesBetweenOwnVillages(
    req: ExchangeMilitaryResBetweenOwnVillageMsReq,
  ): Promise<any> {
    return this.resourcesExchangesMsService.exchangeMilitaryResourcesBetweenSameUserVillages(
      req.senderVillageId,
      req.receiverVillageId,
      req.sentResources,
      req.userId,
    );
  }

  /**
   * Merges a list of units with their actual characteristics (rules).
   *
   * TODO: Migrate the main resources types (info) as a nestJS lib to use the same types everywhere (do while migrating the battle manager)
   * TODO: check if Promise needed as return type or not.
   *
   * @param unitsInfo
   * @returns
   */
  @MessagePattern({ cmd: ResourcesMicroServiceMessages.MERGE_UNIT_RULES })
  mergeUnitsRules(
    unitsInfo: Array<ResourceInfo>,
  ): Array<ResourceInfo | ResourceUnitInfo> {
    return mergeRulesToList(unitsInfo);
  }
}
