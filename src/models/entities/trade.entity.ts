import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TradingMethod } from 'src/shares/enums/trading-method';

@Entity({ name: 'trades' })
export class TradeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pair_id: number;

  @Column()
  buyer_is_taker: boolean;

  @Column()
  buy_user_id: number;

  @Column()
  sell_user_id: number;

  @Column()
  buy_order_id: number;

  @Column()
  sell_order_id: number;

  @Column()
  price: string;

  @Column()
  filled_amount: string;

  @Column()
  sell_fee: string;

  @Column()
  buy_fee: string;

  @Column()
  buy_address: string;

  @Column()
  sell_address: string;

  @Column()
  method: TradingMethod;

  @Column()
  stellar_id: string;

  @Column()
  pool_id: string;

  @Column()
  txid: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  public equals(o: TradeEntity): boolean {
    return this.id === o.id;
  }
}
