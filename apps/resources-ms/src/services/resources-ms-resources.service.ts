import { Injectable } from '@nestjs/common';
import { Village } from '../../../cme-backend/src/villages/village.entity';
import { SentResources } from '../types';

export type SentMilitaryResources = { id: number; count: number };
export type MilitaryResourceQueueType = {
  receiverVillage: Village;
  senderVillage: Village;
  resources: Array<SentMilitaryResources>;
  unique: number;
};

@Injectable()
export class ResourcesResourcesMsService {
  public villageHasEnoughResources(
    village: Village,
    resources: SentResources,
    type: 'INFERIOR' | 'SUPERIOR' = 'INFERIOR',
  ): boolean {
    for (const key of Object.keys(resources)) {
      const villageRes = village.villagesResourceTypes.find(
        (vRes) => vRes.resourceType.type === key,
      );

      if (
        type === 'INFERIOR'
          ? villageRes.count < resources[key].count
          : villageRes.count > resources[key].count
      ) {
        return false;
      }
    }

    return true;
  }

  public villageHasEnoughMilitaryResources(
    village: Village,
    resources: Array<SentMilitaryResources>,
  ): boolean {
    resources.forEach((resource) => {
      const villageRes = village.villagesResourceTypes.find(
        (vRes) => vRes.resourceType.id === resource.id,
      );

      if (villageRes.count < resource.count) {
        return false;
      }
    });

    return true;
  }
}
