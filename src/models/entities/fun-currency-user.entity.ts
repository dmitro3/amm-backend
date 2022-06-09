import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'functional_currency_users',
})
export class FunctionalCurrencyUsers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'currency_id',
  })
  currency_id: number;

  @Column({
    name: 'user_id',
  })
  user_id: number;

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
