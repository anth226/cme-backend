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
} from 'typeorm';
import { User } from '../users/user.entity';
import { Facility } from '../facilities/facility.entity';
import { VillageResourceType } from '../villages-resource-types/village-resource-type.entity';
import { Attack } from '../attacks/attack.entity';

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

  @ManyToOne(() => User, (user) => user.villages, {
    eager: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;

  @OneToMany(() => Facility, (facility) => facility.village)
  facilities: Facility[];

  @OneToMany(
    () => VillageResourceType,
    (villageResourceType) => villageResourceType.village,
    {
      eager: true,
    },
  )
  villagesResourceTypes: VillageResourceType[];

  // The attacks this village started.
  @OneToMany(() => Attack, (attack) => attack.attackerVillage)
  attacksFrom: Attack[];

  // The attacks other villages started on this village.
  @OneToMany(() => Attack, (attack) => attack.defenderVillage)
  attacksTo: Attack[];
}
