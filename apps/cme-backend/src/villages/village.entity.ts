import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  AfterLoad,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Facility } from '../facilities/facility.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { Attack } from '../attacks/attack.entity';
import { MapTile } from '../map-tiles/map-tile.entity';
import { AutomatedVillageHistory } from '../automated-village-history/automated-village-history.entity';

@Entity({ name: 'villages' })
@Unique(['name'])
@Unique(['x', 'y'])
export class Village {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  population: number;

  @Column()
  automated: boolean;

  @Column()
  x: number;

  @Column()
  y: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    name: 'truce_ends_at',
  })
  truceEndsAt: Date;

  // Virtual field, so other players can see village truce status, but not truce duration
  inTrucePeriod: boolean;

  @AfterLoad()
  updateTruceStatus(): void {
    this.inTrucePeriod = this.truceEndsAt.getTime() > Date.now();
  }

  @ManyToOne(() => User, (user) => user.villages, {
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(() => Facility, (facility) => facility.village)
  facilities: Array<Facility>;

  @OneToMany(
    () => VillageResourceType,
    (villageResourceType) => villageResourceType.village,
    {
      eager: true,
    },
  )
  villagesResourceTypes: Array<VillageResourceType>;

  // The attacks this village started.
  @OneToMany(() => Attack, (attack) => attack.attackerVillage)
  attacksFrom: Array<Attack>;

  // The attacks other villages started on this village.
  @OneToMany(() => Attack, (attack) => attack.defenderVillage)
  attacksTo: Array<Attack>;

  @OneToOne(() => MapTile, (mapTile) => mapTile.village)
  mapTile: MapTile;

  @OneToOne(() => AutomatedVillageHistory, (history) => history.village)
  automatedVillageHistory: AutomatedVillageHistory;
}
