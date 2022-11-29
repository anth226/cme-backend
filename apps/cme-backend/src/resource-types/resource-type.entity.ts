import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { ResourceTypePrice } from './resource-type-price.entity';
import { Order } from '../orders/orders.entity';
import { MapTile } from '../map-tiles/map-tile.entity';

@Entity({ name: 'resource_types' })
@Unique(['type'])
export class ResourceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  industry: string;

  @Column('json')
  characteristics: Record<string, any>;

  /*   @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date; */

  @OneToMany(
    () => FacilityTypeResourceType,
    (facilityTypeResourceType) => facilityTypeResourceType.resourceType,
  )
  facilityTypesResourceTypes: Array<FacilityTypeResourceType>;

  @OneToMany(
    () => VillageResourceType,
    (villageResourceType) => villageResourceType.resourceType,
  )
  villagesResourceTypes: Array<VillageResourceType>;

  @OneToMany(
    () => ResourceTypePrice,
    (resourceTypePrice) => resourceTypePrice.targetResourceType,
  )
  targetResourceTypePrices: Array<ResourceTypePrice>;

  @OneToMany(
    () => ResourceTypePrice,
    (resourceTypePrice) => resourceTypePrice.sourceResourceType,
  )
  sourceResourceTypePrices: Array<ResourceTypePrice>;

  @OneToMany(() => Order, (order) => order.resourceType)
  orders: Array<Order>;

  @OneToMany(() => MapTile, (mapTile) => mapTile.terrainResourceType)
  mapTiles: Array<MapTile>;
}
