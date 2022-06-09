import { Expose } from 'class-transformer';
import { PoolCoin } from 'src/models/entities/pool-coins.entity';
import { User } from 'src/models/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pools' })
export class PoolEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  user_id: number;

  @Column('tinyint')
  @Expose()
  type: PoolType;

  @Column('int')
  @Expose()
  early_withdraw_term: number;

  @Column('decimal', { precision: 40, scale: 8 })
  @Expose()
  early_withdraw_fee: string;

  @Column('decimal', { precision: 40, scale: 8 })
  @Expose()
  swap_fee: string;

  @Column('decimal', { precision: 40, scale: 8 })
  @Expose()
  fee_ratio_velo: string;

  @Column('decimal', { precision: 40, scale: 8 })
  @Expose()
  fee_ratio_lp: string;

  @Column('tinyint')
  @Expose()
  status: PoolStatus;

  @Column('json')
  @Expose()
  flex_right_config: string;

  @OneToMany(() => PoolCoin, (poolCoin) => poolCoin.pool)
  pool_coins: PoolCoin[];

  @ManyToOne(() => User, () => {})
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  @Expose()
  message: string;

  @Column()
  @Expose()
  pool_address: string;

  @Column('datetime')
  created_at: string;

  @Column('datetime')
  update_at: string;
}

export enum PoolType {
  Fixed = 1,
  Flexible = 2,
}

export enum PoolStatus {
  Pending = 1,
  Rejected = 2,
  Created = 3,
}
