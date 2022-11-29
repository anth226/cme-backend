import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
// import { Facility} from "../facilities/facility.entity";
// import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';
import { ResourceType } from './resource-type.entity';

@Entity({ name: 'facility_types' })
@Unique(['targetResourceType', 'sourceResourceType'])
export class ResourceTypePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @ManyToOne(
    () => ResourceType,
    (resourceType) => resourceType.targetResourceTypePrices,
  )
  @JoinColumn({
    name: 'target_resource_type_id',
  })
  targetResourceType: ResourceType;

  @ManyToOne(
    () => ResourceType,
    (resourceType) => resourceType.sourceResourceTypePrices,
  )
  @JoinColumn({
    name: 'source_resource_type_id',
  })
  sourceResourceType: ResourceType;
}
