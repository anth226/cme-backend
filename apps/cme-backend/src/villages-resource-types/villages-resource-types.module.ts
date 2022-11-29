import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillageResourceType } from './village-resource-type.entity';
import { VillagesResourceTypesService } from './villages-resource-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([VillageResourceType])],
  providers: [VillagesResourceTypesService],
  exports: [VillagesResourceTypesService],
})
export class VillagesResourceTypesModule {}
