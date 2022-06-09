import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { PoolPnlsPrimaryKeyDto } from 'src/modules/users/dto/pnls-primary-key.dto';

@Entity({
  name: 'pool_pnls',
})
export class PoolPnlEntity {
  @PrimaryColumn()
  date: string;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  wallet: string;

  @PrimaryColumn()
  symbol: string;

  @Column()
  pool_id: string;

  @Column()
  balance: string;

  @Column()
  price: string;

  @Column()
  transfer_amount: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  public static createPnl(
    primaryKey: PoolPnlsPrimaryKeyDto,
    balance: string,
    transferAmount: string,
    price: string,
  ): PoolPnlEntity {
    const newPoolPnl = new PoolPnlEntity();
    newPoolPnl.date = primaryKey.date;
    newPoolPnl.user_id = primaryKey.user_id;
    newPoolPnl.wallet = primaryKey.wallet;
    newPoolPnl.symbol = primaryKey.symbol;
    newPoolPnl.balance = balance;
    newPoolPnl.price = price;
    newPoolPnl.transfer_amount = transferAmount;
    newPoolPnl.pool_id = primaryKey.pool_id;
    return newPoolPnl;
  }
}
