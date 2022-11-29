import * as path from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';

import { ConfigurationModule, ConfigurationService } from '@app/configuration';
import { RedlockModule } from '@app/redlock';

import { Facility } from 'apps/cme-backend/src/facilities/facility.entity';
import { VillageResourceType } from 'apps/cme-backend/src/villages-resource-types/village-resource-type.entity';
import { EventsModule } from 'apps/cme-backend/src/events/events.module';

import { ResourcesMsController } from './resources-ms.controller';
import { ResourcesMsFacilitiesService } from './services/resources-ms-facilities.service';
import { ResourcesUpdaterCronService } from './services/resources-updater-cron.service';
import { ResourcesMsOrdersService } from './services/resources-ms-orders.service';
import { ResourcesMsService } from './services/resources-ms.service';
import { ResourcesMsExchangesService } from './services/resources-ms-exchanges.service';
import { Order } from 'apps/cme-backend/src/orders/orders.entity';
import { Village } from 'apps/cme-backend/src/villages/village.entity';
import { ResourceType } from 'apps/cme-backend/src/resource-types/resource-type.entity';
import { FacilityType } from 'apps/cme-backend/src/facility-types/facility-type.entity';
import { VillageStorageResourceType } from '../../cme-backend/src/villages-resource-types/village-storage-resource-type.entity';
import { ResourcesStorageMsService } from './services/resources-ms-storage.service';
import { ResourcesResourcesMsService } from './services/resources-ms-resources.service';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
      configRoot: path.resolve(__dirname, '..', '..', '..', 'config'),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('typeorm'),
      inject: [ConfigurationService],
    }),
    RedisModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('db.redis'),
      inject: [ConfigurationService],
    }),
    EventsModule,
    RedlockModule,
    TypeOrmModule.forFeature([Facility]),
    TypeOrmModule.forFeature([FacilityType]),
    TypeOrmModule.forFeature([Village]),
    TypeOrmModule.forFeature([VillageResourceType]),
    TypeOrmModule.forFeature([VillageStorageResourceType]),
    TypeOrmModule.forFeature([Order]),
    TypeOrmModule.forFeature([ResourceType]),
  ],
  controllers: [ResourcesMsController],
  providers: [
    ResourcesMsFacilitiesService,
    ResourcesUpdaterCronService,
    ResourcesMsOrdersService,
    ResourcesMsService,
    ResourcesMsExchangesService,
    ResourcesStorageMsService,
    ResourcesResourcesMsService,
  ],
})
export class ResourcesMsModule {
  constructor(private _connection: Connection) {}
}
