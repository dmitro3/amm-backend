import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'functional_currencies',
})
export class FunctionalCurrency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currency: string;

  @Column()
  symbol: string;

  @Column({
    name: 'iso_code',
  })
  iso_code: string;

  @Column({
    name: 'digital_credits',
  })
  digital_credits: string;

  @Column({
    name: 'fractional_unit',
  })
  fractional_unit: number;

  @Column({
    name: 'number_basic',
  })
  number_basic: number;

  @Column({
    name: 'is_active',
  })
  active: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at: Date;
}
