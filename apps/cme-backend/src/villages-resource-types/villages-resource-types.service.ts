import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getManager, Repository } from 'typeorm';
import { VillageResourceType } from './village-resource-type.entity';

@Injectable()
export class VillagesResourceTypesService {
  constructor(
    @InjectRepository(VillageResourceType)
    private villagesResourceTypesRepository: Repository<VillageResourceType>,
  ) {}

  /* async findByVillage(id: Number): Promise<VillageResourceType[]> {
        return this.villagesResourceTypesRepository.
    } */
}
