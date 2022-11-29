import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MainClusteringService } from './clustering.service';
import { UsersModule } from './users/users.module';
import { VillagesModule } from './villages/villages.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { ResourceTypesModule } from './resource-types/resource-types.module';
import { FacilityTypesResourceTypesModule } from './facility-types-resource-types/facility-types-resource-types.module';
import { FacilityTypesModule } from './facility-types/facility-types.module';
import { VillagesResourceTypesModule } from './villages-resource-types/villages-resource-types.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from './events/events.module';
import { RedisModule } from 'nestjs-redis';
import { RedlockModule } from '@app/redlock';
import { OrdersModule } from './orders/orders.module';
import { IndustriesModule } from './industries/industries.module';
import { AttacksModule } from './attacks/attacks.module';
import { ConfigurationModule } from '@app/configuration';
import { ConfigurationService } from '@app/configuration';
import { PublicModule } from './public/public.module';
import { MailModule } from './mail/mail.module';
import { UserGlobalMkcModule } from './user-global-mkc/user-global-mkc.module';
import { MkcModule } from './mkc/mkc.module';
import * as path from 'path';
import { GuildModule } from './guild/guild.module';
import { GuildMembersModule } from './guild-members/guild-members.module';
import { UserWalletTransferModule } from './user-wallet-transfers/user-wallet-transfers.module';
import { isEmpty } from 'lodash';
import { MapTilesModule } from './map-tiles/map-tiles.module';
import { AutomatedVillageHistoryModule } from './automated-village-history/automated-village-history.module';

function routingLogger(req, res, next) {
  if (!req.originalUrl?.startsWith('/auth/login')) {
    console.log(
      '\x1b[36mRouting log -',
      '\x1b[0m',
      `${new Date()} -`,
      '\x1b[34m',
      `${req.method}`,
      '\x1b[0m',
      `on ${req.originalUrl} ${
        !isEmpty(req.body)
          ? 'with body ' + JSON.stringify(req.body, null, '')
          : ''
      }`,
    );
  }
  next();
}

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
    RedlockModule,
    UsersModule,
    VillagesModule,
    FacilitiesModule,
    AuthModule,
    MailModule,
    ResourceTypesModule,
    FacilityTypesResourceTypesModule,
    FacilityTypesModule,
    VillagesResourceTypesModule,
    EventsModule,
    OrdersModule,
    IndustriesModule,
    AttacksModule,
    PublicModule,
    UserGlobalMkcModule,
    UserWalletTransferModule,
    MkcModule,
    GuildModule,
    GuildMembersModule,
    MapTilesModule,
    AutomatedVillageHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, MainClusteringService],
})
export class AppModule {
  constructor(private _connection: Connection) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(routingLogger).forRoutes('*');
  }
}
