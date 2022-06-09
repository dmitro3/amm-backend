import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({
  name: 'gradually',
})
export class GraduallyEntity {
  @PrimaryColumn()
  pool_address: string;

  @Column()
  start_block: number;

  @Column()
  end_block: number;

  @Column()
  old_weights: string;

  @Column()
  new_weights: string;
}
