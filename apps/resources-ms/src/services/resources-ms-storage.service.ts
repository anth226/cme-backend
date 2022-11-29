import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import {
  ALL_FACILITIES,
  StorageFacilityBuilding,
  facilityRules,
} from '@app/game-rules';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';
import * as Promise from 'bluebird';
import { Facility } from '../../../cme-backend/src/facilities/facility.entity';
import { TransferableResource, TransferType } from '../service-messages';
import { VillageStorageResourceType } from '../../../cme-backend/src/villages-resource-types/village-storage-resource-type.entity';
import {
  ERROR_FACILITY_HAS_MAXIMUM_AMOUNT_OF_RESOURCES,
  ERROR_FACILITY_HAS_NO_MORE_RESOURCES,
  ERROR_FACILITY_STORAGE_NOT_FOUND,
  ERROR_RESOURCE_NOT_FOUND,
  ERROR_VILLAGE_NOT_ENOUGH_RESOURCES,
} from '@app/errors';

import { SentResources } from '../types';
import { ResourcesMsExchangesService } from './resources-ms-exchanges.service';
import { ResourcesResourcesMsService } from './resources-ms-resources.service';

@Injectable()
export class ResourcesStorageMsService {
  private resourceTypes: ReadonlyArray<ResourceType>;
  private logger: Logger = new Logger('ResourcesMsFacilitiesService');

  constructor(
    private resourcesMsExchangesService: ResourcesMsExchangesService,
    private resourcesMsResourcesService: ResourcesResourcesMsService,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
    @InjectRepository(VillageStorageResourceType)
    private villagesStorageResourceTypesRepository: Repository<VillageStorageResourceType>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>,
  ) {}

  async onModuleInit() {
    this.resourceTypes = await this.resourceTypesRepository.find({});
  }

  async transferResourcesToStorage(
    village: Village,
    facility: Facility,
    resource: TransferableResource,
    transferType: TransferType,
  ): Promise<VillageStorageResourceType> {
    const resourceType = this.resourceTypes.find(
      (_resource: ResourceType) => _resource.type === resource.type,
    );

    if (isEmpty(resourceType)) {
      return ERROR_RESOURCE_NOT_FOUND;
    }

    const sentResourcesFormatted: SentResources = {};

    sentResourcesFormatted[resource.type] = {
      count: resource.count,
      resourceTypeId: resourceType.id,
    };

    if (
      !this.resourcesMsResourcesService.villageHasEnoughResources(
        village,
        sentResourcesFormatted,
      )
    ) {
      return ERROR_VILLAGE_NOT_ENOUGH_RESOURCES;
    }

    let foundStorageFromFacilityId = await this.villagesStorageResourceTypesRepository.findOne(
      {
        where: {
          facility,
        },
      },
    );

    if (transferType === 'WITHDRAW') {
      if (isEmpty(foundStorageFromFacilityId)) {
        return ERROR_FACILITY_STORAGE_NOT_FOUND;
      }

      if (
        foundStorageFromFacilityId.count <= 0 ||
        foundStorageFromFacilityId.count < resource.count
      ) {
        return ERROR_FACILITY_HAS_NO_MORE_RESOURCES;
      }
    }

    if (transferType === 'DEPOSIT') {
      const facilityDescriptor = facilityRules.findFacilityDescriptorByType(
        facility.facilityType.type as ALL_FACILITIES,
      ) as StorageFacilityBuilding;

      const currentFacilityLevelDescriptor =
        facilityDescriptor.levels[facility.level];

      if (
        foundStorageFromFacilityId &&
        foundStorageFromFacilityId.count >=
          currentFacilityLevelDescriptor.maximum_storage
      ) {
        return ERROR_FACILITY_HAS_MAXIMUM_AMOUNT_OF_RESOURCES;
      }

      if (
        foundStorageFromFacilityId &&
        foundStorageFromFacilityId.count + resource.count >=
          currentFacilityLevelDescriptor.maximum_storage
      ) {
        const recomputedCount =
          currentFacilityLevelDescriptor.maximum_storage -
          foundStorageFromFacilityId.count;
        sentResourcesFormatted[resource.type] = {
          count: recomputedCount,
          resourceTypeId: resourceType.id,
        };
        resource.count = recomputedCount;
      }
    }

    if (isEmpty(foundStorageFromFacilityId)) {
      foundStorageFromFacilityId = await this.villagesStorageResourceTypesRepository.save(
        {
          facility,
          resourceType,
          count: 0,
        },
      );
    }

    const remainingResources = this.resourcesMsExchangesService.addOrRemoveResourcesToVillage(
      sentResourcesFormatted,
      village,
      transferType === 'DEPOSIT',
    );

    await this.villagesResourceTypesRepository
      .save(remainingResources)
      .catch((e) => {
        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });

    foundStorageFromFacilityId.count =
      transferType === 'WITHDRAW'
        ? foundStorageFromFacilityId.count - resource.count
        : foundStorageFromFacilityId.count + resource.count;

    facility.villageStorageResourceType = await this.villagesStorageResourceTypesRepository.save(
      foundStorageFromFacilityId,
    );

    return facility;
  }
}
