import { FacilityType } from '../facility-types/facility-type.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'industries' })
@Unique(['name'])
export class Industry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => FacilityType, (facilityType) => facilityType.industry)
  facilityTypes: Array<FacilityType>;
}
