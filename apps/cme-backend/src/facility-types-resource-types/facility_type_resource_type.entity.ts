import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FacilityType } from '../facility-types/facility-type.entity';
import { ResourceType } from '../resource-types/resource-type.entity';

@Entity({ name: 'facility_types_resource_types' })
export class FacilityTypeResourceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  levelCost: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(
    () => FacilityType,
    (facilityType) => facilityType.facilityTypesResourceTypes,
  )
  @JoinColumn({
    name: 'facility_type_id',
  })
  facilityType: FacilityType;

  @ManyToOne(
    () => ResourceType,
    (resourceType) => resourceType.facilityTypesResourceTypes,
  )
  @JoinColumn({
    name: 'resource_type_id',
  })
  resourceType: ResourceType;
}
