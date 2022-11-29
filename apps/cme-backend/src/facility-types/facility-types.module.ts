import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityType } from './facility-type.entity';
import { FacilityTypesService } from './facility-types.service';
import { FacilityTypesController } from './facility-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityType])],
  providers: [FacilityTypesService],
  exports: [FacilityTypesService],
  controllers: [FacilityTypesController],
})
export class FacilityTypesModule {}
