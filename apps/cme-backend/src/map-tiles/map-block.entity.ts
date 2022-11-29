import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'map_blocks' })
export class MapBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  x1: number;

  @Column()
  y1: number;

  @Column()
  x2: number;

  @Column()
  y2: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}
