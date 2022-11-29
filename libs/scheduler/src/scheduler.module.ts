import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [RedisModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
