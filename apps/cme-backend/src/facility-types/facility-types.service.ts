import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityType } from './facility-type.entity';

@Injectable()
export class FacilityTypesService {
  constructor(
    @InjectRepository(FacilityType)
    private facilityTypesRepository: Repository<FacilityType>,
  ) {}

  findAll(): Promise<Array<FacilityType>> {
    return this.facilityTypesRepository.find();
  }
}
