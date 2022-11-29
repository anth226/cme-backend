import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { isEmpty } from 'lodash';
import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { CreateFacilityMsReq } from '../service-messages';
import {
  ALL_FACILITIES,
  computeBuildingCost,
  facilityRules,
  findBuildingType,
  RESOURCES,
} from '@app/game-rules';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';
import { Village } from 'apps/cme-backend/src/villages/village.entity';
import { FacilityType } from 'apps/cme-backend/src/facility-types/facility-type.entity';
import { ERROR_SAVING_FACILITY, ERROR_UPGRADING_FACILITY } from '@app/errors';

@Injectable()
export class ResourcesMsFacilitiesService {
  private logger: Logger = new Logger('ResourcesMsFacilitiesService');
  private facilityTypes: Array<FacilityType>;

  constructor(
    private connection: Connection,
    @InjectRepository(Facility)
    private facilitiesRepository: Repository<Facility>,
    @InjectRepository(FacilityType)
    private facilityTypesRepository: Repository<FacilityType>,
    @InjectRepository(Village)
    private villageRepository: Repository<Village>,
  ) {}

  async onModuleInit() {
    this.facilityTypes = await this.facilityTypesRepository.find();
  }

  findAllForVillage(villageId: number): Promise<Array<Facility>> {
    return this.facilitiesRepository.find({
      where: { village: { id: villageId } },
    });
  }

  findOne(id: number): Promise<Facility> {
    return this.facilitiesRepository.findOne({
      where: { id },
    });
  }

  async upgradeFacility(facility: Facility): Promise<Facility | HttpException> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const buildingType = findBuildingType(facility.facilityType.type);

    try {
      if (
        buildingType === 'militaryBuilding' ||
        buildingType === 'levelableBuilding'
      ) {
        // it's military, check for tiers and upgrade if possible
        if (
          !facilityRules.checkIfFacilityNextLevel(
            facility.facilityType.type,
            facility.level,
          )
        ) {
          throw new Error('Facility already at max level');
        }
      }

      const resTypesCosts = computeBuildingCost(
        facility.facilityType.type as ALL_FACILITIES,
        facility.level + 1,
      );

      // First, check if the village has all the necessary resources to upgrade the facility.
      resTypesCosts.forEach((cost) => {
        const villageResource: VillageResourceType = facility.village.villagesResourceTypes.find(
          (vrt: VillageResourceType) =>
            vrt.resourceType.type ===
            ((cost.resourcesType as unknown) as string),
        );

        if (!villageResource || villageResource?.count < cost.amount) {
          throw new Error('Insufficient resources');
        }
      });

      // Then, remove the cost from the village.
      for (const cost of resTypesCosts) {
        const res = facility.village.villagesResourceTypes.find(
          (vrt) =>
            vrt.resourceType.type ===
            ((cost.resourcesType as unknown) as string),
        );

        await queryRunner.query(`
          UPDATE villages_resource_types AS vrt
          SET
            count = count - ${cost.amount},
            updated_at = NOW()
          WHERE vrt.village_id = ${facility.village.id}
          AND vrt.resource_type_id = ${res.resourceType.id}
        `);
      }

      facility = await queryRunner.manager
        .getRepository(Facility)
        .save({ ...facility, level: facility.level + 1 });
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return new HttpException(err, HttpStatus.NOT_FOUND);
      return ERROR_UPGRADING_FACILITY;
    } finally {
      await queryRunner.release();
    }

    return facility;
  }

  async create(data: CreateFacilityMsReq): Promise<Facility | HttpException> {
    const facility = data.facility;
    let facilityEntity: Facility;
    const type = this.facilityTypes?.find(
      (ft) => ft.id === facility.facilityType,
    );

    if (isEmpty(type)) {
      return new HttpException(
        'Facility type not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    const populatedType = type.type as ALL_FACILITIES;
    const resTypesCosts = computeBuildingCost(populatedType, 0);
    const village = await this.villageRepository.findOne(facility.village);

    // TODO: have a better control over auth for facilities.
    if (data.userId !== village.user.id) {
      return new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (isEmpty(village)) {
      return new HttpException('Village not found', HttpStatus.BAD_REQUEST);
    }

    const hasMaximum = facilityRules.hasMaximumFacilityTypeForVillage(
      populatedType,
      village,
    );
    if (hasMaximum) {
      return new HttpException(
        'Max number of this facility on your village',
        HttpStatus.FORBIDDEN,
      );
    }

    let hasResources = true;
    for (const rtc of resTypesCosts) {
      const resourceRequested = village.villagesResourceTypes.find(
        (vrt) =>
          ((vrt.resourceType.type as unknown) as RESOURCES) ===
          rtc.resourcesType,
      );
      if (rtc.amount > resourceRequested.count) {
        hasResources = false;
      }
    }

    if (!hasResources) {
      return new HttpException(
        'Insufficient resources',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // TODO: this part could be async (a direct task) to gain time.
      // But need to make sure that the facility.save is validated first.
      for (const cost of resTypesCosts) {
        const res = village.villagesResourceTypes.find(
          (vrt) =>
            vrt.resourceType.type ===
            ((cost.resourcesType as unknown) as string),
        );
        await queryRunner.query(`
          UPDATE villages_resource_types AS vrt
          SET
            count = count - ${cost.amount},
            updated_at = NOW()
          WHERE vrt.village_id = ${village.id}
          AND vrt.resource_type_id = ${res.resourceType.id}
        `);
      }

      facilityEntity = await queryRunner.manager
        .getRepository(Facility)
        .save(facility);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return ERROR_SAVING_FACILITY;
    } finally {
      await queryRunner.release();
    }

    // TODO: later when the code is splitted and websockets are implemented, see to remove this and return facilityEntity instead.
    return this.facilitiesRepository.findOne(facilityEntity.id);
  }

  async remove(id: number): Promise<void> {
    await this.facilitiesRepository.delete(id);
  }
}
