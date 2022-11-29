import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { Village } from '../villages/village.entity';

@Entity({ name: 'automated_village_history' })
@Unique(['x', 'y'])
export class AutomatedVillageHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column({ name: 'is_removed' })
  isRemoved: boolean;

  @OneToMany(
    () => VillageResourceType,
    (villageResourceType) => villageResourceType.automatedVillageHistory,
    {
      eager: true,
    },
  )
  initialVillageResources: Array<VillageResourceType>;

  @OneToOne(() => Village, (village) => village.automatedVillageHistory)
  @JoinColumn({ name: 'village_id' })
  village: Village;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
