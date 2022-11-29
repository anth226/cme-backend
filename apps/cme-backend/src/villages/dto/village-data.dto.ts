import { Village } from '../village.entity';

export interface VillageAttacks {
  isUnderAttack: boolean;
  incomingAttacksCount: number;
}

export class VillageDataDto extends Village implements VillageAttacks {
  incomingAttacksCount: number;
  isUnderAttack: boolean;
}
