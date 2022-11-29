import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import {
  BASE_RESOURCES,
  MILITARY_RESOURCES,
  RESOURCES_QUEUE,
} from '@app/game-rules';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { VillageStorageResourceType } from '../../../cme-backend/src/villages-resource-types/village-storage-resource-type.entity';
import {
  MilitaryResourceQueueType,
  ResourcesResourcesMsService,
  SentMilitaryResources,
} from './resources-ms-resources.service';

// TODO/ FACTORISE
type SentResource = Readonly<{
  resourceTypeId: number;
  count: number;
}>;

const computeTravelTime = (distance: number, slowestSpeed: number): number => {
  const travelTimeAsHours = distance / slowestSpeed;
  return Math.round(travelTimeAsHours * 1000 * 60);
};

// TODO/ FACTORISE
type SentResources = {
  [key: string]: SentResource;
};

const EXCHANGEABLE_RESOURCES: ReadonlyArray<BASE_RESOURCES> = Object.values(
  BASE_RESOURCES,
);
const EXCHANGEABLE_MILITARY_RESOURCES: ReadonlyArray<MILITARY_RESOURCES> = Object.values(
  MILITARY_RESOURCES,
);

@Injectable()
export class ResourcesMsExchangesService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;
  private logger: Logger = new Logger('ResourcesMsFacilitiesService');

  constructor(
    private connection: Connection,
    private redisService: RedisService,
    private resourceMsResourceService: ResourcesResourcesMsService,
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
    @InjectRepository(VillageStorageResourceType)
    private villagesStorageResourceTypesRepository: Repository<VillageStorageResourceType>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>, // @InjectRepository(Industry) // private industriesRepository: Repository<Industry>,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();
  }

  public addOrRemoveResourcesToVillage(
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

  private removeMiliteryResourcesToVillage(
    sentResourcesFormatted: any,
    village: Village,
    shouldRemove = true,
  ): Array<VillageResourceType> {
    const villageResourcesLeftAfterExchange: Array<VillageResourceType> = [];
    for (const villageResourceType of village.villagesResourceTypes) {
      const resourceRequested = sentResourcesFormatted.find(
        (resource: { id: number }) =>
          resource.id === villageResourceType.resourceType.id,
      );

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
   * @param sentResources
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
    if (
      !this.resourceMsResourceService.villageHasEnoughResources(
        senderVillage,
        sentResourcesFormatted,
      )
    ) {
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

    const sentResourcesFormatted: Array<SentMilitaryResources> = [];
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

      sentResourcesFormatted.push({
        count: res.count,
        id: resType.id,
      });
    }

    if (hasForbiddenResources) {
      return new HttpException(
        `Can only exchange military resources: ${EXCHANGEABLE_MILITARY_RESOURCES.toString()}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!sentResourcesFormatted.length) {
      return new HttpException('No resources to send', HttpStatus.BAD_REQUEST);
    }

    // Check if enough resources available in senderVillage
    if (
      !this.resourceMsResourceService.villageHasEnoughMilitaryResources(
        senderVillage,
        sentResourcesFormatted,
      )
    ) {
      return new HttpException(
        'Sender village has less resources than requested.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Remove resources from senderVillage.
    const senderVillageResourcesLeftAfterExchange = this.removeMiliteryResourcesToVillage(
      sentResourcesFormatted,
      senderVillage,
      true,
    );

    const distance = Math.sqrt(
      Math.pow(senderVillage.x - receiverVillage.x, 2) +
        Math.pow(senderVillage.y - receiverVillage.y, 2),
    );

    const resourceItemsToBeTransferred = await this.resourceTypesRepository.findByIds(
      sentResourcesFormatted.map((res) => res.id),
    );

    let slowestSpeed = 0;
    // find the slowest speed of the sent resources
    resourceItemsToBeTransferred.forEach((res) => {
      if (
        Object.values(MILITARY_RESOURCES).includes(
          res.type as MILITARY_RESOURCES,
        )
      ) {
        const speed = res.characteristics.speed;
        if (slowestSpeed === 0 || speed < slowestSpeed) {
          slowestSpeed = speed;
        }
      }
    });
    const travelTime = computeTravelTime(distance, slowestSpeed);
    const resourcesTransferQueue: MilitaryResourceQueueType = {
      resources: sentResourcesFormatted,
      receiverVillage: receiverVillage,
      senderVillage: senderVillage,
      unique: Math.random(),
    };
    await this.villagesResourceTypesRepository
      .save(senderVillageResourcesLeftAfterExchange)
      .then(() => {
        this.redisClient.zadd(
          RESOURCES_QUEUE.RECEIVER_VILLAGE_RESOURCES_UPDATE,
          Date.now() + travelTime,
          JSON.stringify(resourcesTransferQueue),
        );
      });
    return {};
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async resourceTransferWithRedis() {
    await Promise.mapSeries(
      [RESOURCES_QUEUE.RECEIVER_VILLAGE_RESOURCES_UPDATE],
      async (resourceType: string) => {
        switch (resourceType) {
          case RESOURCES_QUEUE.RECEIVER_VILLAGE_RESOURCES_UPDATE:
            // list of resources to be added to the village (executing time is less than or equal current time)
            const resourceToBeAdded = await this.redisClient.zrangebyscore(
              resourceType,
              '-inf',
              Date.now(),
            );
            resourceToBeAdded.forEach(async (item) => {
              const queueData: MilitaryResourceQueueType = JSON.parse(item);
              const villageResources = await this.villagesResourceTypesRepository.find(
                {
                  where: {
                    village: queueData.receiverVillage,
                  },
                },
              );

              const data: Array<VillageResourceType> = [];
              queueData.resources.forEach((resource: SentMilitaryResources) => {
                const resourceType = villageResources.find(
                  (villageResource) =>
                    villageResource.resourceType.id === resource.id,
                );
                if (!isEmpty(resourceType)) {
                  resourceType.count += resource.count;
                  data.push(resourceType);
                } else {
                  const newResourceType = new VillageResourceType();
                  const resType = new ResourceType();
                  resType.id = resource.id;
                  newResourceType.resourceType = resType;
                  newResourceType.village = queueData.receiverVillage;
                  newResourceType.count = resource.count;
                  data.push(newResourceType);
                }
              });

              this.villagesResourceTypesRepository
                .save(data)
                .then(() => {
                  // remove from redis after successfully added to village
                  this.redisClient.zrem(
                    resourceType,
                    JSON.stringify(queueData),
                  );
                })
                .catch((err) => {
                  // revert resources to the sender villageResources if failed to add to receiver village
                  this.villagesResourceTypesRepository
                    .find({
                      where: {
                        village: queueData.senderVillage,
                      },
                    })
                    .then((senderVillageResources) => {
                      const data: Array<VillageResourceType> = [];
                      queueData.resources.forEach(
                        (resource: { id: number; count: number }) => {
                          const resourceType = senderVillageResources.find(
                            (villageResource) =>
                              villageResource.resourceType.id === resource.id,
                          );
                          if (!isEmpty(resourceType)) {
                            resourceType.count += resource.count;
                            data.push(resourceType);
                          }
                        },
                      );
                      this.villagesResourceTypesRepository
                        .save(data)
                        .then(() => {
                          // remove from redis after successfully added to village
                          this.redisClient.zrem(
                            resourceType,
                            JSON.stringify(queueData),
                          );
                        });
                    });
                });
            });
            break;
          default:
            break;
        }
      },
    );
  }

  // Same for units but with travel time.
}
