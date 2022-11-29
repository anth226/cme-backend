import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Facility } from '../facilities/facility.entity';
import { ResourceType } from '../resource-types/resource-type.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'ordered_quantity',
  })
  orderedQuantity: number;

  @Column({
    name: 'delivered_quantity',
  })
  deliveredQuantity: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.orders, {
    eager: true,
  })
  @JoinColumn({
    name: 'facility_id',
  })
  facility: Facility;

  @ManyToOne(() => ResourceType, (resourceType) => resourceType.orders, {
    eager: true,
  })
  @JoinColumn({
    name: 'resource_type_id',
  })
  resourceType: ResourceType;
}
