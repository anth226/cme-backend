import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
  AfterLoad,
  OneToOne,
} from 'typeorm';
import { Village } from '../villages/village.entity';
import { FacilityType } from '../facility-types/facility-type.entity';
import { Order } from '../orders/orders.entity';
import {
  ALL_FACILITIES,
  computeBuildingCost,
  FacilityTypeResPrice,
} from '@app/game-rules';
import { VillageStorageResourceType } from '../villages-resource-types/village-storage-resource-type.entity';
import { isEmpty } from 'lodash';

@Entity({ name: 'facilities' })
@Unique(['village', 'location'])
export class Facility {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  location: number;

  @Column({
    name: 'last_production_at',
  })
  lastProductionAt: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'is_in_production',
  })
  isInProduction: boolean;

  @ManyToOne(() => FacilityType, (facilityType) => facilityType.facilities, {
    eager: true,
  })
  @JoinColumn({
    name: 'facility_type_id',
  })
  facilityType: FacilityType;

  @ManyToOne(() => Village, (village) => village.facilities)
  @JoinColumn({
    name: 'village_id',
  })
  village: Village;

  @OneToMany(() => Order, (order) => order.facility)
  orders: Array<Order>;

  nextUpgradeCost?: ReadonlyArray<FacilityTypeResPrice>;

  @OneToOne(() => VillageStorageResourceType, (vsrt) => vsrt.facility, {
    eager: true,
  })
  villageStorageResourceType?: VillageStorageResourceType;

  @AfterLoad()
  removeResourceTypeIfEmpty(): void {
    if (isEmpty(this.villageStorageResourceType)) {
      this.villageStorageResourceType = undefined;
    }
  }

  @AfterLoad()
  generateNextUpgradeCost(): void {
    this.nextUpgradeCost = computeBuildingCost(
      this.facilityType.type as ALL_FACILITIES,
      this.level + 1,
    );
  }
}
