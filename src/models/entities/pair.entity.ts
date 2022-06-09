import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pairs' })
export class PairEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  base_id: number;

  @Column()
  quote_id: number;

  @Column()
  amount_precision: string;

  @Column()
  minimum_amount: string;

  @Column()
  minimum_total: string;

  @Column()
  price_precision: string;

  @Column()
  group_count: number;

  @Column()
  is_active: number;

  @Column()
  created_at: string;
}
