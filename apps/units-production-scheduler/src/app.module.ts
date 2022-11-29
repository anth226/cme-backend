import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SchedulerModule } from '@app/scheduler';
import { ConfigurationModule } from '@app/configuration';
import { ConfigurationService } from '@app/configuration';
import * as path from 'path';
import { RedisModule } from 'nestjs-redis';
import { RedlockModule } from '@app/redlock';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigurationModule.register({
      projectRoot: path.resolve(__dirname, '..'),
      configRoot: path.resolve(__dirname, '..', '..', '..', 'config'),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (configurationService: ConfigurationService) =>
        configurationService.get('db.redis'),
      inject: [ConfigurationService],
    }),
    ScheduleModule.forRoot(),
    SchedulerModule,
    RedlockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
