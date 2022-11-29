import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulerService } from '@app/scheduler';
import * as Promise from 'bluebird';
import { RedlockService } from '@app/redlock';
import { MILITARY_RESOURCES } from '@app/game-rules';

@Injectable()
export class AppService {
  constructor(
    private schedulerService: SchedulerService,
    private redlockService: RedlockService,
  ) {}

  @Cron('* * * * * *')
  async moveDelayedTasksToPendingTasksList() {
    // TO DO: fetch from DB
    const resourceTypes = [
      [MILITARY_RESOURCES.STONE_HUNTER],
      [MILITARY_RESOURCES.STONE_SLINGER],
      [MILITARY_RESOURCES.STONE_SMASHER],
      [MILITARY_RESOURCES.BERSERKER],
      [MILITARY_RESOURCES.TRIBAL_WARRIOR],
      [MILITARY_RESOURCES.TRIBAL_ARCHER],
      [MILITARY_RESOURCES.TRIBAL_BRUTE],
      [MILITARY_RESOURCES.TRIBAL_CHARGER],
      [MILITARY_RESOURCES.SWORDSMAN],
      [MILITARY_RESOURCES.ARCHER],
      [MILITARY_RESOURCES.AX_LORD],
      [MILITARY_RESOURCES.EXECUTIONER],
      [MILITARY_RESOURCES.CONSCRIPT],
      [MILITARY_RESOURCES.RIFLEMAN],
      [MILITARY_RESOURCES.HEAVY_GUNNER],
      [MILITARY_RESOURCES.ARMORED_CHARGER],
      [MILITARY_RESOURCES.MODERN_INFANTRY],
      [MILITARY_RESOURCES.SHARPSHOOTER],
      [MILITARY_RESOURCES.BLACK_OPS],
      [MILITARY_RESOURCES.DEMOLITION_UNIT],
    ];

    const eventsType = ['normal', 'return'];

    await Promise.map([...resourceTypes, ...eventsType], (type: string) => {
      const zsetName = `delayed:${type}`;
      const listName = `pending:${type}`;
      const lockName = `triggered-resource-producer:schedule:${zsetName}`;
      return this.redlockService.attempt(lockName, 10000, async () => {
        await this.schedulerService.moveFromZsetToList({
          delayedTasksZsetKey: zsetName,
          start: 0,
          stop: 20,
          pendingTasksListKey: listName,
        });
      });
    });
  }
}
