import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { isEmpty, some, uniq } from 'lodash';
import { RedisService } from 'nestjs-redis';

import { CreateOrderMsReq } from '../service-messages';
import { Order } from 'apps/cme-backend/src/orders/orders.entity';
import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { ResourceType } from 'apps/cme-backend/src/resource-types/resource-type.entity';
import {
  MilitaryResourceUnit,
  MILITARY_BUILDINGS,
  MILITARY_RESOURCES,
  barrackDescriptor,
  relatedUnitDescriptors,
} from '@app/game-rules';

@Injectable()
export class ResourcesMsOrdersService {
  private logger: Logger = new Logger('ResourcesMsOrdersService');

  constructor(
    private connection: Connection,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private redisService: RedisService,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
    @InjectRepository(ResourceType)
    private resourceTypesRepository: Repository<ResourceType>,
  ) {}

  // For the moment creates onmy work for barracks
  async create(order: CreateOrderMsReq): Promise<Order | HttpException> {
    let orderEntity;

    if (order.orderedQuantity <= 0) {
      return new HttpException('Order at least 1 unit', HttpStatus.BAD_REQUEST);
    }

    const facility = await this.facilitiesRepository.findOne({
      where: { id: order.facilityId },
    });

    if (isEmpty(facility)) {
      return new HttpException('Facility not found', HttpStatus.NOT_FOUND);
    }

    if (facility.facilityType.type !== MILITARY_BUILDINGS.BARRACK) {
      return new HttpException(
        'Facility must be a Barrack to order units',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resourceRequested = await this.resourceTypesRepository.findOne({
      where: { type: order.unitName },
    });

    if (
      isEmpty(resourceRequested) ||
      isEmpty(relatedUnitDescriptors[resourceRequested.type])
    ) {
      return new HttpException(
        'Requested resource does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check if available at this level
    const tier = barrackDescriptor.tiers.find((t) => t.tier === facility.level);
    const isAvailable =
      tier.availableMilitaryResources.indexOf(
        resourceRequested.type as MILITARY_RESOURCES,
      ) >= 0;

    if (!isAvailable) {
      return new HttpException(
        `Unit not available at level ${facility.level}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if enough resources
    let hasEnoughResources = true;

    const descriptor: MilitaryResourceUnit =
      relatedUnitDescriptors[resourceRequested.type];

    const resources = facility.village.villagesResourceTypes.filter((res) =>
      ['food', 'iron', 'wood'].includes(res.resourceType.type),
    );

    if (resources.length !== 3) {
      hasEnoughResources = false;
    }

    resources.forEach((res) => {
      switch (res.resourceType.type) {
        case 'food':
          const rtPriceFood =
            descriptor.productionCosts.food * order.orderedQuantity;
          if (res.count < rtPriceFood) {
            hasEnoughResources = false;
          }
          break;
        case 'iron':
          const rtPriceIron =
            descriptor.productionCosts.iron * order.orderedQuantity;
          if (res.count < rtPriceIron) {
            hasEnoughResources = false;
          }
          break;

        case 'wood':
          const rtPriceWood =
            descriptor.productionCosts.wood * order.orderedQuantity;
          if (res.count < rtPriceWood) {
            hasEnoughResources = false;
          }
          break;

        default:
          break;
      }
    });

    if (!hasEnoughResources) {
      return new HttpException(
        'Insufficient resources',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if facility already in use
    if (facility.isInProduction) {
      return new HttpException(
        'Facility already in production',
        HttpStatus.BAD_REQUEST,
      );
    }

    const villageId = facility.village.id;
    const resourceType = resourceRequested.type;
    const productionTimeAsMilliseconds = descriptor.productionTime * 1000;

    const resourceTypeIdAmounts = Object.keys(
      descriptor.productionCosts,
    ).reduce((acc, type, i) => {
      const resType = resources.find((res) => res.resourceType.type === type);

      // Exclude mkc price for the moment
      if (!resType) {
        return acc;
      }

      return `${acc}${i === 0 ? '' : ','}(${resType.resourceType.id},${
        descriptor.productionCosts[type] * order.orderedQuantity
      })`;
    }, '');

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query(`
          UPDATE villages_resource_types AS vrt
          SET
            count = count - v.amount,
            updated_at = NOW()
          FROM (values ${resourceTypeIdAmounts}) AS v(resource_type_id, amount)
          WHERE
            vrt.village_id = ${villageId} AND
            vrt.resource_type_id = v.resource_type_id
      `);

      order.resourceType = resourceRequested;
      order.facility = { id: order.facilityId };
      orderEntity = await queryRunner.manager.getRepository(Order).save(order);

      await queryRunner.manager.getRepository(Facility).save({
        ...facility,
        isInProduction: true,
      });

      await queryRunner.commitTransaction();

      const redisClient = await this.redisService.getClient();
      await redisClient
        .zadd(
          `delayed:${resourceType}`,
          Date.now() + productionTimeAsMilliseconds,
          JSON.stringify({
            orderId: orderEntity.id,
            resourceTypeId: resourceRequested.id,
            orderedQuantity: orderEntity.orderedQuantity,
            productionTime: descriptor.productionTime,
            villageId,
            facilityId: order.facilityId,
            queue: `pending:${resourceType}`,
            action: 'create',
          }),
        )
        .catch((e) => {
          console.error(e);
        });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new HttpException(err, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }

    orderEntity = await this.ordersRepository.findOne(orderEntity.id); // TODO: maybe remove this part.

    return orderEntity;
  }
}
