import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { VillageResourceType } from '../../../cme-backend/src/villages-resource-types/village-resource-type.entity';
import { BASE_RESOURCES, MILITARY_RESOURCES } from '../rules';
import { ResourceType } from '../../../cme-backend/src/resource-types/resource-type.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Promise from 'bluebird';
import * as Redis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { DevTravelTimeMode } from 'apps/cme-backend/src/attacks/dto/create-attack.dto';
import { env } from 'process';

type SentResource = Readonly<{
  resourceTypeId: number;
  count: number;
}>;

const computeTravelTime = (
  distance: number,
  slowestSpeed: number,
  mode: DevTravelTimeMode = DevTravelTimeMode.DEFAULT,
): number => {
  const travelTimeAsHours = distance / slowestSpeed;

  if (env.NODE_ENV === 'dev' && mode !== DevTravelTimeMode.DEFAULT) {
    switch (mode) {
      case DevTravelTimeMode.INSTANT:
        return 0;
      case DevTravelTimeMode.HOURS_AS_MINUTES:
        return Math.round(travelTimeAsHours * 1000 * 60);
      default:
        break;
    }
  }

  // When ready to have hours-long attacks moves, replace this by
  // return Math.round(travelTimeAsHours * HOUR_AS_MS)
  return Math.round(travelTimeAsHours * 1000 * 60);
};

type SentResources = {
  [key: string]: SentResource;
};

type SentMilitaryResources = { id: number; count: number };

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

const villageHasEnoughMilitaryResources = (
  village: Village,
  resources: SentMilitaryResources[],
): boolean => {
  resources.forEach((resource) => {
    const villageRes = village.villagesResourceTypes.find(
      (vRes) => vRes.resourceType.id === resource.id,
    );

    if (villageRes.count < resource.count) {
      return false;
    }
  });

  return true;
};
const EXCHANGEABLE_RESOURCES: ReadonlyArray<BASE_RESOURCES> = Object.values(
  BASE_RESOURCES,
);
const RECEIVER_VILLAGE_RESOURCES_QUEUE = 'receiver-village-resources:queue';
const EXCHANGEABLE_MILITARY_RESOURCES: ReadonlyArray<MILITARY_RESOURCES> = Object.values(
  MILITARY_RESOURCES,
);

@Injectable()
export class ResourcesMsExchangesService {
  private redisClient: Redis.Redis;
  private queryRunner: QueryRunner;

  constructor(
    private connection: Connection,
    private redisService: RedisService,
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>, // @InjectRepository(Industry) // private industriesRepository: Repository<Industry>,
  ) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.connect();
  }

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

    const sentResourcesFormatted: SentMilitaryResources[] = [];
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
      !villageHasEnoughMilitaryResources(senderVillage, sentResourcesFormatted)
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

    await this.villagesResourceTypesRepository
      .save(senderVillageResourcesLeftAfterExchange)
      .then(() => {
        this.redisClient.zadd(
          RECEIVER_VILLAGE_RESOURCES_QUEUE,
          Date.now() + travelTime,
          JSON.stringify({
            resources: sentResourcesFormatted,
            receiverVillageId: receiverVillage.id,
            unique: Math.random(),
          }),
        );
      });
    return {};
  }

  @Cron(CronExpression.EVERY_SECOND)
  async resourceTransferWithRedis() {
    await Promise.mapSeries(
      [RECEIVER_VILLAGE_RESOURCES_QUEUE],
      async (resourceType: string) => {
        // list of resources to be added to the village (executing time is less than or equal current time)
        const resourceToBeAdded = await this.redisClient.zrangebyscore(
          resourceType,
          '-inf',
          Date.now(),
        );
        resourceToBeAdded.forEach(async (item) => {
          const queueData = JSON.parse(item);
          const villageResources = await this.villagesResourceTypesRepository.find(
            {
              where: {
                village: queueData.receiverVillageId,
              },
            },
          );

          const data: VillageResourceType[] = [];
          queueData.resources.forEach(
            (resource: { id: number; count: number }) => {
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
                const village = new Village();
                village.id = queueData.receiverVillageId;
                resType.id = resource.id;
                newResourceType.resourceType = resType;
                newResourceType.village = village;
                newResourceType.count = resource.count;
                data.push(newResourceType);
              }
            },
          );

          this.villagesResourceTypesRepository.save(data).then(() => {
            // remove from redis after successfully added to village
            this.redisClient.zremrangebyscore(resourceType, '-inf', Date.now());
          });
        });
      },
    );
  }

  // Same for units but with travel time.
}
