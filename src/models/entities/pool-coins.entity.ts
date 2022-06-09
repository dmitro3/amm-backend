import { PoolEntity } from 'src/models/entities/pool.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pool_coins' })
export class PoolCoin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pool_id: number;

  @Column()
  coin_id: number;

  @Column()
  weight: string;

  @Column()
  is_active: number;

  @ManyToOne(() => PoolEntity, (pool) => pool.pool_coins)
  @JoinColumn({ name: 'pool_id' })
  pool: PoolEntity;

  @Column()
  updated_at: Date;

  @Column()
  created_at: Date;
}
