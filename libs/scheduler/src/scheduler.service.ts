import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as Redis from 'ioredis';
import * as _ from 'lodash';
// import { RedlockService } from '@app/redlock';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private redisClient: Redis.Redis;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    this.redisClient = await this.redisService.getClient();
  }

  async moveFromZsetToList({
    delayedTasksZsetKey,
    start,
    stop,
    pendingTasksListKey,
  }) {
    const now = Date.now();
    const results = await this.redisClient.zrange(
      delayedTasksZsetKey,
      start,
      stop,
      'WITHSCORES',
    );

    for (let i = 0; i < results.length; i += 2) {
      const item = {
        member: results[i],
        score: parseInt(results[i + 1]),
      };

      if (item.score > now) {
        return;
      }

      console.log(item);
      const result = await this.redisClient
        .multi()
        .rpush(pendingTasksListKey, item.member)
        .zrem(delayedTasksZsetKey, item.member)
        .exec();

      console.log(result);
    }
  }
}
