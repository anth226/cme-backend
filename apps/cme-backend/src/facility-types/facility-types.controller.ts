import { Controller, Get, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Public } from '../public.decorator';
import { FacilityType } from './facility-type.entity';
import { FacilityTypesService } from './facility-types.service';

@Controller('facility-types')
export class FacilityTypesController {
  constructor(private facilityTypesService: FacilityTypesService) {}

  @Public()
  @Get()
  async index(@Request() req): Promise<Array<FacilityType>> {
    return this.facilityTypesService.findAll();
  }
}
