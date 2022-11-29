import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitiesController } from './facilities.controller';
import { Facility } from './facility.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { EventsModule } from '../events/events.module';
import { RedlockModule } from '@app/redlock';

@Module({
  imports: [
    TypeOrmModule.forFeature([Facility]),
    TypeOrmModule.forFeature([VillageResourceType]),
    EventsModule,
    RedlockModule,
  ],
  controllers: [FacilitiesController],
  providers: [],
})
export class FacilitiesModule {}
