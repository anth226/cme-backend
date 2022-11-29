import { Industry } from '../industries/industry.entity';
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
import { Facility } from '../facilities/facility.entity';
import { FacilityTypeResourceType } from '../facility-types-resource-types/facility_type_resource_type.entity';

@Entity({ name: 'facility_types' })
@Unique(['type'])
export class FacilityType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('json')
  parameters: Record<string, any>;

  /* @CreateDateColumn({
    name: 'created_at'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date; */

  @ManyToOne(() => Industry, (industry) => industry.facilityTypes, {
    eager: true,
  })
  @JoinColumn({
    name: 'industry',
  })
  industry: Industry;

  @OneToMany(() => Facility, (facility) => facility.facilityType)
  facilities: Array<Facility>;

  @OneToMany(
    () => FacilityTypeResourceType,
    (facilityTypeResourceType) => facilityTypeResourceType.resourceType,
  )
  facilityTypesResourceTypes: Array<FacilityTypeResourceType>;
}
