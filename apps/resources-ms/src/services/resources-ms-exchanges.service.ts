import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import { BASE_RESOURCES, MILITARY_RESOURCES } from '../rules';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';
type SentResource = Readonly<{
  resourceTypeId: number;
  count: number;
}>;

type SentResources = {
  [key: string]: SentResource;
};

const villageHasEnoughResources = (
  village: Village,
  resources: SentResources,
): boolean => {
  for (const key of Object.keys(resources)) {
    const villageRes = village.villagesResourceTypes.find(
      (vRes) => vRes.resourceType.type === key,
    );

    if (villageRes.count < resources[key].count) {
      return false;
    }
  }

  return true;
};

const EXCHANGEABLE_RESOURCES: ReadonlyArray<BASE_RESOURCES> = Object.values(
  BASE_RESOURCES,
);
const EXCHANGEABLE_MILITARY_RESOURCES: ReadonlyArray<MILITARY_RESOURCES> = Object.values(
  MILITARY_RESOURCES,
);

@Injectable()
export class ResourcesMsExchangesService {
  constructor(
    private connection: Connection,
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>, // @InjectRepository(Industry) // private industriesRepository: Repository<Industry>,
  ) {}

  private addOrRemoveResourcesToVillage(
    sentResourcesFormatted: any,
    village: Village,
    shouldRemove = true,
  ): Array<VillageResourceType> {
    const villageResourcesLeftAfterExchange: Array<VillageResourceType> = [];

    for (const villageResourceType of village.villagesResourceTypes) {
      const resourceRequested =
        sentResourcesFormatted[villageResourceType.resourceType.type];

      if (!isEmpty(resourceRequested)) {
        const countLeftAfterExchange = shouldRemove
          ? villageResourceType.count - resourceRequested.count
          : villageResourceType.count + resourceRequested.count;

        villageResourceType.count = countLeftAfterExchange;
      }

      villageResourcesLeftAfterExchange.push(villageResourceType);
    }

    return villageResourcesLeftAfterExchange;
  }

  private addOrRemoveMiliteryResourcesToVillage(
    sentResourcesFormatted: any,
    village: Village,
    shouldRemove = true,
  ): Array<VillageResourceType> {
    const villageResourcesLeftAfterExchange: Array<VillageResourceType> = [];

    // if village don't have sent-type military resources existing then add it
    if (!shouldRemove) {
      const vRType = village.villagesResourceTypes.map(
        (vrt) => vrt.resourceType.type,
      );
      const vRTypeMilitary = Object.keys(sentResourcesFormatted).map((key) => {
        return { [key]: sentResourcesFormatted[key] };
      });
      const newVRT = vRTypeMilitary.filter((item) => {
        const keys = Object.keys(item);
        return keys.some((key) => !vRType.includes(key));
      });

      newVRT.forEach((item) => {
        const values = Object.values(item);
        const villageResourceType = new VillageResourceType();
        villageResourceType.resourceType = values[0].resourceTypeId;
        villageResourceType.count = values[0].count;
        villageResourceType.village = village;
        villageResourcesLeftAfterExchange.push(villageResourceType);
      });
    }
    for (const villageResourceType of village.villagesResourceTypes) {
      const resourceRequested =
        sentResourcesFormatted[villageResourceType.resourceType.type];

      if (!isEmpty(resourceRequested)) {
        const countLeftAfterExchange = shouldRemove
          ? villageResourceType.count - resourceRequested.count
          : villageResourceType.count + resourceRequested.count;

        villageResourceType.count = countLeftAfterExchange;
      }

      villageResourcesLeftAfterExchange.push(villageResourceType);
    }

    return villageResourcesLeftAfterExchange;
  }

  /**
   *
   * @param senderVillage
   * @param receiverVillage
   * @returns Promise<any>
   */
  private async exchangeResourcesBetweenVillages(
    senderVillage: Village,
    receiverVillage: Village,
    sentResources: Array<{
      type: string;
      count: number;
    }>,
  ): Promise<any> {
    if (isEmpty(senderVillage)) {
      return new HttpException(
        'Sender village not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEmpty(receiverVillage)) {
      return new HttpException(
        'Receiver village not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const sentResourcesFormatted: SentResources = {};
    let hasForbiddenResources = false;
    const resourceTypes: ReadonlyArray<ResourceType> = await this.resourceTypesRepository.find();

    for (const res of sentResources) {
      if (!res?.type) {
        return;
      }

      if (
        !EXCHANGEABLE_RESOURCES.includes(
          (res.type as unknown) as BASE_RESOURCES,
        )
      ) {
        hasForbiddenResources = true;
      }

      const resType: ResourceType = resourceTypes.find(
        (rt: ResourceType) => rt.type === res.type,
      );

      if (isEmpty(resType)) {
        return;
      }

      sentResourcesFormatted[res.type] = {
        count: res.count,
        resourceTypeId: resType.id,
      };
    }

    if (hasForbiddenResources) {
      return new HttpException(
        `Can only exchange base resources: ${EXCHANGEABLE_RESOURCES.toString()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isEmpty(sentResourcesFormatted)) {
      return new HttpException('No resources to send', HttpStatus.BAD_REQUEST);
    }

    // Check if enough resources available in senderVillage
    if (!villageHasEnoughResources(senderVillage, sentResourcesFormatted)) {
      return new HttpException(
        'Sender village has less resources than requested.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Remove resources from senderVillage.
    const senderVillageResourcesLeftAfterExchange = this.addOrRemoveResourcesToVillage(
      sentResourcesFormatted,
      senderVillage,
      true,
    );

    // Add resources on receiverVillage.
    const receiverVillageResourcesTotalAfterExchange = this.addOrRemoveResourcesToVillage(
      sentResourcesFormatted,
      receiverVillage,
      false,
    );

    // Save the updated resourceTypes.
    await this.villagesResourceTypesRepository
      .save(senderVillageResourcesLeftAfterExchange)
      .catch((e) => {
        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });

    await this.villagesResourceTypesRepository
      .save(receiverVillageResourcesTotalAfterExchange)
      .catch((e) => {
        return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
      });

    return {};
  }

  async exchangeResourcesBetweenSameUserVillages(
    senderVillageId: number,
    receiverVillageId: number,
    sentResources: Array<{
      type: string;
      count: number;
    }>,
    userId: number,
  ): Promise<any> {
    if (senderVillageId === receiverVillageId) {
      return new HttpException(
        'Sender and receiver villages cannot be the same village',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if senderVillage and receiverVillage are both from userId (might change when Guilds are implemented).
    const senderVillage: Village = await this.villagesRepository.findOne({
      where: { id: senderVillageId },
      relations: ['user', 'villagesResourceTypes'],
    });

    const receiverVillage: Village = await this.villagesRepository.findOne({
      where: { id: receiverVillageId },
      relations: ['user', 'villagesResourceTypes'],
    });

    if (
      senderVillage?.user?.id !== userId ||
      receiverVillage?.user?.id !== userId
    ) {
      return new HttpException(
        'Both sender and receiver villages must be owned by you',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.exchangeResourcesBetweenVillages(
      senderVillage,
      receiverVillage,
      sentResources,
    );
  }

  // sendMilitaryResourcesBetweenSameUserVillages
  async exchangeMilitaryResourcesBetweenSameUserVillages(
    senderVillageId: number,
    receiverVillageId: number,
    sentResources: Array<{
      type: string;
      count: number;
    }>,
    userId: number,
  ): Promise<any> {
    if (senderVillageId === receiverVillageId) {
      return new HttpException(
        'Sender and receiver villages cannot be the same village',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if senderVillage and receiverVillage are both from userId (might change when Guilds are implemented).
    const senderVillage: Village = await this.villagesRepository.findOne({
      where: { id: senderVillageId },
      relations: ['user', 'villagesResourceTypes'],
    });

    const receiverVillage: Village = await this.villagesRepository.findOne({
      where: { id: receiverVillageId },
      relations: ['user', 'villagesResourceTypes'],
    });

    if (
      senderVillage?.user?.id !== userId ||
      receiverVillage?.user?.id !== userId
    ) {
      return new HttpException(
        'Both sender and receiver villages must be owned by you',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.exchangeMilitaryResourcesBetweenVillages(
      senderVillage,
      receiverVillage,
      sentResources,
    );
  }

  private async exchangeMilitaryResourcesBetweenVillages(
    senderVillage: Village,
    receiverVillage: Village,
    sentResources: Array<{
      type: string;
      count: number;
    }>,
  ): Promise<any> {
    if (isEmpty(senderVillage)) {
      return new HttpException(
        'Sender village not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (isEmpty(receiverVillage)) {
      return new HttpException(
        'Receiver village not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const sentResourcesFormatted: SentResources = {};
    let hasForbiddenResources = false;
    const resourceTypes: ReadonlyArray<ResourceType> = await this.resourceTypesRepository.find();

    for (const res of sentResources) {
      if (!res?.type) {
        return;
      }
      // todo: check if resource is military (need to add to resourceTypes)
      if (
        !EXCHANGEABLE_MILITARY_RESOURCES.includes(
          (res.type as unknown) as MILITARY_RESOURCES,
        )
      ) {
        hasForbiddenResources = true;
      }

      const resType: ResourceType = resourceTypes.find(
        (rt: ResourceType) => rt.type === res.type,
      );

      if (isEmpty(resType)) {
        return;
      }

      sentResourcesFormatted[res.type] = {
        count: res.count,
        resourceTypeId: resType.id,
      };
    }

    if (hasForbiddenResources) {
      return new HttpException(
        `Can only exchange military resources: ${EXCHANGEABLE_MILITARY_RESOURCES.toString()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (isEmpty(sentResourcesFormatted)) {
      return new HttpException('No resources to send', HttpStatus.BAD_REQUEST);
    }

    // Check if enough resources available in senderVillage
    if (!villageHasEnoughResources(senderVillage, sentResourcesFormatted)) {
      return new HttpException(
        'Sender village has less resources than requested.',
        HttpStatus.BAD_REQUEST,
      );
    }
    // console.log(sentResourcesFormatted, 'sentResourcesFormatted');

    // Remove resources from senderVillage.
    const senderVillageResourcesLeftAfterExchange = this.addOrRemoveMiliteryResourcesToVillage(
      sentResourcesFormatted,
      senderVillage,
      true,
    );

    // Add resources on receiverVillage.
    const receiverVillageResourcesTotalAfterExchange = this.addOrRemoveMiliteryResourcesToVillage(
      sentResourcesFormatted,
      receiverVillage,
      false,
    );

    // Save the updated resourceTypes.
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(senderVillageResourcesLeftAfterExchange);
      await queryRunner.manager.save(
        receiverVillageResourcesTotalAfterExchange,
      );
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return {};
  }

  // Same for units but with travel time.
}
