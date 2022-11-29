import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as Redlock from 'redlock';

@Injectable()
export class RedlockService implements OnModuleInit {
  private redlock: Redlock;

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    const redisClient = await this.redisService.getClient();
    this.redlock = new Redlock([redisClient], {
      retryCount: 0,
    });
  }

  async attempt(resource: string, ttl: number, cb: () => void) {
    let lock;
    try {
      lock = await this.redlock.lock(resource, ttl);
      await cb();
    } catch (err) {
      console.error('RedlockService.attempt()', err);
    } finally {
      if (lock) {
        await lock.unlock().catch((err) => {
          console.error('RedlockService.attempt(): Error releasing lock', err);
        });
      }
    }
  }
}
