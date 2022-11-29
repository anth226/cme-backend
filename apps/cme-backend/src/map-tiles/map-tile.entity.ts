import { ResourceType } from '../resource-types/resource-type.entity';
import { Village } from '../villages/village.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';

export enum MapTileType {
  VILLAGE = 'village',
  RESOURCE_TERRAIN = 'resource_terrain',
  EMPTY = 'empty',
}

@Entity({ name: 'map_tiles' })
@Unique(['x', 'y'])
export class MapTile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column('enum', { enum: MapTileType })
  type: MapTileType;

  @ManyToOne(
    () => ResourceType,
    (resourceType) => resourceType.villagesResourceTypes,
    {
      nullable: true,
      eager: true,
    },
  )
  @JoinColumn({
    name: 'resource_type_id',
  })
  terrainResourceType?: ResourceType;

  @Column({ name: 'village_name' })
  villageName: string;

  @Column({ name: 'is_passable' })
  isPassable: boolean;

  @OneToOne(() => Village, (village) => village.mapTile)
  @JoinColumn({ name: 'village_id' })
  village?: Village;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
