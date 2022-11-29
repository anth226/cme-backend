import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, getConnection, getManager, Repository } from 'typeorm';
import * as Promise from 'bluebird';
import { minBy, max, isEmpty } from 'lodash';

import { Village } from './village.entity';
import { User } from '../users/user.entity';
import { ResourceType } from '../resource-types/resource-type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { CreateVillageDto } from './dto/create-village.dto';
import { FacilityType } from '../facility-types/facility-type.entity';
import { Facility } from '../facilities/facility.entity';
import { VillageDataDto } from './dto/village-data.dto';
import { Attack } from '../attacks/attack.entity';
import { BUILDINGS } from '@app/game-rules';
import { MapTile, MapTileType } from '../map-tiles/map-tile.entity';
import { processName } from '../naming/naming';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MapBlock } from '../map-tiles/map-block.entity';
import {
  automatedVillageInitialResources,
  MAX_AUTOMATED_VILLAGES_IN_MAP_BLOCK,
} from '@app/game-rules';
import { AutomatedVillageHistory } from '../automated-village-history/automated-village-history.entity';

const MAX_VILLAGES_PER_USER = 5;
const MAX_DISTANCE_VILLAGE_CREATION = 10;

const BASE_FACILITIES = [
  BUILDINGS.CROPLAND,
  BUILDINGS.IRON_MINE,
  BUILDINGS.SAWMILL,
  BUILDINGS.MONKEY_COIN_MINE,
];
const RESOURCES_NEEDED_NEW_VILLAGE = 35000;

@Injectable()
export class VillagesService {
  private logger: Logger = new Logger('VillagesService');

  constructor(
    @InjectRepository(Village)
    private villagesRepository: Repository<Village>,
    @InjectRepository(Attack)
    private attacksRepository: Repository<Attack>,
    @InjectRepository(MapTile)
    private mapTileRepository: Repository<MapTile>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(MapBlock)
    private mapBlocksRepository: Repository<MapBlock>,
    @InjectRepository(FacilityType)
    private facilityTypesRepository: Repository<FacilityType>,
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
  ) {}

  findAll(): Promise<Array<Village>> {
    return this.villagesRepository.find();
  }

  findAllForUserId(userId: string): Promise<Array<Village>> {
    return this.villagesRepository.find({ where: { user: { id: userId } } });
  }

  findAllAround(x: number, y: number, offset: number): Promise<Array<Village>> {
    let x_min = x - offset;
    if (x_min < 0) {
      x_min = 0;
    }

    let y_min = y - offset;
    if (y_min < 0) {
      y_min = 0;
    }

    return this.villagesRepository.find({
      where: [
        {
          x: Between(x_min, x + offset),
          y: Between(y_min, y + offset),
        },
      ],
    });
  }

  findRectangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): Promise<Array<Village>> {
    return this.villagesRepository.find({
      where: [
        {
          x: Between(x1, x2),
          y: Between(y1, y2),
        },
      ],
    });
  }

  async findOne(id: string): Promise<VillageDataDto> {
    const village = await this.villagesRepository.findOne({
      where: { id },
      relations: ['facilities', 'villagesResourceTypes'],
    });

    const qb = this.attacksRepository.createQueryBuilder('attack');
    qb.select('COUNT(attack.*)', 'incomingAttacksCount');
    qb.where('attack.defender_village_id = :defender', { defender: id });
    qb.andWhere('attack.is_under_attack');

    const data = await qb.getRawOne<{ incomingAttacksCount: string }>();
    const attacksCount = +data.incomingAttacksCount;
    return {
      ...village,
      ...data,
      incomingAttacksCount: attacksCount,
      isUnderAttack: attacksCount > 0,
    };
  }

  async createFirstFacilitiesForVillage(
    villageId: number,
  ): Promise<Array<Facility>> {
    const facilities = await this.facilityTypesRepository.find();
    const mainFacilities = facilities.filter((facility) =>
      BASE_FACILITIES.includes(facility.type as BUILDINGS),
    );

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const finalFacilities = [];

    try {
      for (const facilityType of mainFacilities) {
        const index = mainFacilities.indexOf(facilityType);
        const facility: any = {
          location: index,
          village: villageId,
          facilityType: facilityType.id,
          level: 1,
        };

        finalFacilities.push(
          await queryRunner.manager.getRepository(Facility).save(facility),
        );
      }
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return finalFacilities;
  }

  checkIfHasEnoughResourcesForNewVillage(villages: Array<Village>): boolean {
    let totalWood = 0;
    let totalIron = 0;
    let totalFood = 0;

    villages.forEach((village) => {
      const resources = village.villagesResourceTypes.filter((res) =>
        ['food', 'iron', 'wood'].includes(res.resourceType.type),
      );

      resources.forEach((res) => {
        switch (res.resourceType.type) {
          case 'food':
            totalFood += res.count;
            break;
          case 'iron':
            totalIron += res.count;
            break;

          case 'wood':
            totalWood += res.count;
            break;

          default:
            break;
        }
      });
    });

    return (
      totalWood >= RESOURCES_NEEDED_NEW_VILLAGE &&
      totalIron >= RESOURCES_NEEDED_NEW_VILLAGE &&
      totalFood >= RESOURCES_NEEDED_NEW_VILLAGE
    );
  }

  removeResourcesForVillageCreation(villages: Array<Village>) {
    const leftToRemove = {
      food: RESOURCES_NEEDED_NEW_VILLAGE,
      iron: RESOURCES_NEEDED_NEW_VILLAGE,
      wood: RESOURCES_NEEDED_NEW_VILLAGE,
    };

    villages.forEach((village: Village) => {
      const resources = village.villagesResourceTypes.filter((res) =>
        ['food', 'iron', 'wood'].includes(res.resourceType.type),
      );
      const removeFromThisVillage = {
        food: 0,
        iron: 0,
        wood: 0,
      };
      const villageResourceTypesAfter: Array<VillageResourceType> = [];

      resources.forEach((res: VillageResourceType) => {
        const type = res.resourceType.type;

        if (leftToRemove[type] > 0 && res.count > 0) {
          const shouldRemove = minBy([res.count, leftToRemove[type]]);

          removeFromThisVillage[type] = shouldRemove;
          leftToRemove[type] -= shouldRemove;

          villageResourceTypesAfter.push({
            ...res,
            count: max([res.count - shouldRemove, 0]),
          });
        }
      });

      this.villagesResourceTypesRepository
        .save(villageResourceTypesAfter)
        .catch((e) => {
          console.error(e);
        });
    });
  }

  checkClosestVillageDistance(
    village_x: number,
    village_y: number,
  ): Promise<Village> {
    return this.villagesRepository.find({
      where: [
        {
          x: Between(
            village_x - MAX_DISTANCE_VILLAGE_CREATION,
            village_x + MAX_DISTANCE_VILLAGE_CREATION,
          ),
          y: Between(
            village_y - MAX_DISTANCE_VILLAGE_CREATION,
            village_y + MAX_DISTANCE_VILLAGE_CREATION,
          ),
        },
      ],
    });
  }

  checkOccupiedMapTile(x: number, y: number): Promise<MapTile> {
    return this.mapTileRepository.find({
      where: {
        x,
        y,
      },
    });
  }

  async create(villageDto: CreateVillageDto, userId: number): Promise<Village> {
    const user = await this.usersRepository.findOneOrFail(userId);
    const villagesForThisUser = await this.villagesRepository.find({
      where: { user: { id: userId } },
    });

    const occupiedMapTile = await this.checkOccupiedMapTile(
      villageDto.x,
      villageDto.y,
    );

    if (!isEmpty(occupiedMapTile)) {
      throw new HttpException(
        `Your village is overlaying an occupied tile, creation is blocked`,
        HttpStatus.BAD_REQUEST,
      );
    }
    villageDto.name = processName(villageDto.name);

    const closestVillages = await this.checkClosestVillageDistance(
      villageDto.x,
      villageDto.y,
    );

    if (closestVillages.length == 0) {
      throw new HttpException(
        `Your village is too far from other villages, creation is blocked`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let facilities = [];

    const nbVillages = villagesForThisUser.length;

    if (nbVillages >= MAX_VILLAGES_PER_USER) {
      throw new HttpException(
        `You already have ${nbVillages} village${
          nbVillages > 1 ? 's' : ''
        }, villages creation per user is blocked to ${MAX_VILLAGES_PER_USER}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const hasEnoughResources = this.checkIfHasEnoughResourcesForNewVillage(
      villagesForThisUser,
    );

    if (nbVillages > 0 && !hasEnoughResources) {
      throw new HttpException(
        `You need a total of ${RESOURCES_NEEDED_NEW_VILLAGE} of food, ${RESOURCES_NEEDED_NEW_VILLAGE} of iron and ${RESOURCES_NEEDED_NEW_VILLAGE} of food shared between all of your villages to create a new one.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    let village = { ...villageDto, user };

    await getManager().transaction(async (transactionalEntityManager) => {
      const resourceTypes = await getConnection()
        .createQueryBuilder()
        .select('resource_types')
        .from(ResourceType, 'resource_types')
        .where('resource_types.type IN (:...types)', {
          types: ['food', 'iron', 'wood', 'mkc'],
        })
        .getMany();

      let resourceQuantity = 0;
      let mkcQuantity = 0;

      if (user.new) {
        resourceQuantity = 100;
        mkcQuantity = 200000;
        await transactionalEntityManager.update(
          User,
          { id: user.id },
          { new: false },
        );
      }

      const mapTile = await transactionalEntityManager
        .getRepository(MapTile)
        .save({
          x: villageDto.x,
          y: villageDto.y,
          type: MapTileType.VILLAGE,
          villageName: villageDto.name,
        });

      village = await transactionalEntityManager
        .getRepository(Village)
        .save({ ...village, mapTile });

      await Promise.map(resourceTypes, (resourceType: ResourceType) => {
        const villageResourceType = new VillageResourceType();
        Object.assign(villageResourceType, {
          resourceType,
          village,
          count: resourceType.type === 'mkc' ? mkcQuantity : resourceQuantity,
        });
        return transactionalEntityManager.save(villageResourceType);
      });
    });

    if (nbVillages > 1 && hasEnoughResources) {
      this.removeResourcesForVillageCreation(villagesForThisUser);
    }

    facilities = await this.createFirstFacilitiesForVillage(village.id);

    return { ...village, facilities };
  }

  async remove(id: string): Promise<void> {
    await this.villagesRepository.delete(id);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async removeAndGenerateAutomatedVillages() {
    await this.removeEmptyAutomatedVillages();
    await this.generateAutomatedVillages();
  }

  async removeEmptyAutomatedVillages() {
    const automatedVillages = await getConnection()
      .createQueryBuilder(Village, 'v')
      .innerJoinAndSelect('v.automatedVillageHistory', 'h')
      .innerJoinAndSelect('v.mapTile', 'm')
      .innerJoinAndSelect('v.villagesResourceTypes', 'vr')
      .where('v.automated = true AND h.is_removed = false')
      .getMany();

    for (const automatedVillage of automatedVillages) {
      const hasResources = this.checkIfAutomatedVillageHasResources(
        automatedVillage,
      );

      if (!hasResources) {
        getManager().transaction(async (transactionalEntityManager) => {
          await transactionalEntityManager
            .getRepository(MapTile)
            .delete(automatedVillage.mapTile.id);

          await transactionalEntityManager
            .getRepository(VillageResourceType)
            .delete({ village: { id: automatedVillage.id } });

          await transactionalEntityManager
            .getRepository(AutomatedVillageHistory)
            .update({ village: automatedVillage }, { isRemoved: true });
        });
      }
    }
  }

  async generateAutomatedVillages() {
    const mapBlocks = await this.mapBlocksRepository.find();
    for (const mapBlock of mapBlocks) {
      const blockTiles = await this.mapTileRepository.find({
        where: {
          x: Between(mapBlock.x1, mapBlock.x2),
          y: Between(mapBlock.y1, mapBlock.y2),
        },
        relations: ['village'],
      });

      const blockTilesWithAutomatedVillages = blockTiles.filter(
        (tile) => tile.village?.automated,
      );

      if (
        blockTilesWithAutomatedVillages.length >=
        MAX_AUTOMATED_VILLAGES_IN_MAP_BLOCK
      ) {
        continue;
      }

      const unusedTileLocation = this.findRandomUnusedTileLocation(
        mapBlock,
        blockTiles,
      );

      if (!unusedTileLocation) {
        this.logger.log(
          `No available tile for automated village in block (${mapBlock.x1}, ${mapBlock.y1} -> ${mapBlock.x2}, ${mapBlock.y2})`,
        );
        continue;
      }

      getManager().transaction(async (transactionalEntityManager) => {
        const resourceTypes = await getConnection()
          .createQueryBuilder()
          .select('resource_types')
          .from(ResourceType, 'resource_types')
          .where('resource_types.type IN (:...types)', {
            types: ['food', 'iron', 'wood', 'mkc'],
          })
          .getMany();

        const automatedVillage = new Village();

        automatedVillage.x = unusedTileLocation[0];
        automatedVillage.y = unusedTileLocation[1];
        automatedVillage.name = `Automated Village ${automatedVillage.x}${automatedVillage.y}`;
        automatedVillage.population = 0;
        automatedVillage.automated = true;

        automatedVillage.mapTile = await transactionalEntityManager
          .getRepository(MapTile)
          .save({
            x: automatedVillage.x,
            y: automatedVillage.y,
            type: MapTileType.VILLAGE,
          });

        await transactionalEntityManager
          .getRepository(Village)
          .save(automatedVillage);

        await transactionalEntityManager
          .getRepository(AutomatedVillageHistory)
          .save({
            x: automatedVillage.x,
            y: automatedVillage.y,
            village: automatedVillage,
          });

        // Save village resources
        await Promise.map(resourceTypes, (resourceType: ResourceType) => {
          const villageResourceType = new VillageResourceType();
          Object.assign(villageResourceType, {
            resourceType,
            village: automatedVillage,
            count: automatedVillageInitialResources.get(resourceType.type),
          });
          return transactionalEntityManager.save(villageResourceType);
        });

        // Save history initial resources
        await Promise.map(resourceTypes, (resourceType: ResourceType) => {
          const villageResourceType = new VillageResourceType();
          Object.assign(villageResourceType, {
            resourceType,
            automatedVillageHistory: automatedVillage.automatedVillageHistory,
            count: automatedVillageInitialResources.get(resourceType.type),
          });
          return transactionalEntityManager.save(villageResourceType);
        });
      });
    }
  }

  findRandomUnusedTileLocation(
    mapBlock: MapBlock,
    mapTiles: Array<MapTile>,
  ): [number, number] | undefined {
    const initialPosition = {
      x: randomIntegerBetween(mapBlock.x1, mapBlock.x2),
      y: randomIntegerBetween(mapBlock.y1, mapBlock.y2),
    };

    const rightSearch = { x: initialPosition.x, y: initialPosition.y };

    while (!(rightSearch.x == mapBlock.x2 && rightSearch.y == mapBlock.y2)) {
      const positionUsed = mapTiles.find(
        (tile) => tile.x == rightSearch.x && tile.y == rightSearch.y,
      );

      if (!positionUsed) {
        return [rightSearch.x, rightSearch.y];
      }

      if (rightSearch.x < mapBlock.x2) {
        rightSearch.x++;
      } else {
        rightSearch.x = mapBlock.x1;
        rightSearch.y++;
      }
    }

    const leftSearch = { x: initialPosition.x, y: initialPosition.y };

    while (!(leftSearch.x == mapBlock.x1 && leftSearch.y == mapBlock.x1)) {
      const positionUsed = mapTiles.find(
        (tile) => tile.x == leftSearch.x && tile.y == leftSearch.y,
      );

      if (!positionUsed) {
        return [leftSearch.x, leftSearch.y];
      }

      if (leftSearch.x > mapBlock.x1) {
        leftSearch.x--;
      } else {
        leftSearch.x = mapBlock.x2;
        leftSearch.y--;
      }
    }

    return;
  }

  checkIfAutomatedVillageHasResources(village: Village): boolean {
    for (const resource of village.villagesResourceTypes) {
      if (resource.count > 0) return true;
    }
    return false;
  }
}

function randomIntegerBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
