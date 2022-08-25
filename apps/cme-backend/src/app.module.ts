import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
import { UserGlobalMkcModule } from './user-global-mkc/user-global-mkc.module';
import { MkcModule } from './mkc/mkc.module';
import * as path from 'path';
import { GuildModule } from './guild/guild.module';
import { GuildMembersModule } from './guild-members/guild-members.module';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
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
    MkcModule,
    GuildModule,
    GuildMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private _connection: Connection) {}
}
