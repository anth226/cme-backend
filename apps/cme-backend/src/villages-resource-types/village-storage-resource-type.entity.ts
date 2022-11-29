import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ResourceType } from '../resource-types/resource-type.entity';
import { Facility } from '../facilities/facility.entity';

@Entity({ name: 'villages_storage_resource_types' })
export class VillageStorageResourceType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  count: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @OneToOne(() => Facility, (facility) => facility.id)
  @JoinColumn({
    name: 'facility_id',
  })
  facility: Facility;

  @ManyToOne(() => ResourceType, (resource) => resource.id, { eager: true })
  @JoinColumn({
    name: 'resource_type_id',
  })
  resourceType: ResourceType;

  toJSON?() {
    return {
      ...this,
      count: Number(this.count),
    };
  }
}
