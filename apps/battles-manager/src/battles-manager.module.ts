import { ConfigurationModule, ConfigurationService } from '@app/configuration';
// import { RedlockModule } from '@app/redlock';
// import { SchedulerModule } from '@app/scheduler';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from 'nestjs-redis';
import * as path from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { BattlesManagerController } from './battles-manager.controller';
import { BattlesManagerService } from './battles-manager.service';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
      configRoot: path.resolve(__dirname, '..', '..', '..', 'config'),
    }),
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
    ScheduleModule.forRoot(),
    /* SchedulerModule,
    RedlockModule, */
  ],
  controllers: [BattlesManagerController],
  providers: [BattlesManagerService],
})
export class BattlesManagerModule {
  constructor(private _connection: Connection) {}
}
