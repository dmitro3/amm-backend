import { isEqual } from 'src/modules/matching-engine/util/helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BigNumber } from '@0x/utils';
import { OrderSide, OrderStatus, OrderType } from 'src/modules/orders/orders.const';
import { TradingMethod } from 'src/shares/enums/trading-method';

@Entity({ name: 'orders' })
export class OrderEntity {
  // common columns
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  pair_id: number;

  @Column()
  type: OrderType;

  @Column()
  side: OrderSide;

  @Column()
  price: string;

  @Column()
  average: string;

  @Column()
  amount: string;

  @Column()
  filled_amount: string; // include fee

  @Column()
  remaining_amount: string; // exclude fee

  @Column()
  total: string;

  @Column()
  status: OrderStatus;

  @Column()
  method: TradingMethod;

  @Column()
  fee_rate: string;
  // end common columns

  // bsc order columns
  @Column()
  maker_token: string;

  @Column()
  taker_token: string;

  @Column()
  maker_amounts: string;

  @Column()
  taker_amounts: string;

  @Column()
  sender: string;

  @Column()
  maker: string;

  @Column()
  taker: string;

  @Column()
  taker_token_fee_amounts: string;

  @Column()
  fee_recipient: string;

  @Column()
  signature: string;

  @Column()
  salt: string;

  @Column()
  order_hash: string;
  // end bsc order columns

  // stellar order columns
  @Column()
  stellar_id: string;
  // end stellar order columns

  // pool order columns
  @Column()
  pool_id: string;

  @Column()
  expiry: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  public equals(o: OrderEntity): boolean {
    return this.id === o.id;
  }

  public getAmountIncludedFee(amount: string | BigNumber): string {
    return new BigNumber(amount).div(new BigNumber(1).minus(this.fee_rate)).toString();
  }

  public getAmountExcludedFee(amount: string | BigNumber): string {
    return new BigNumber(amount).times(new BigNumber(1).minus(this.fee_rate)).toString();
  }

  public isBuyOrder(): boolean {
    return OrderSide.Buy === this.side;
  }

  public isSellOrder(): boolean {
    return OrderSide.Sell === this.side;
  }

  public isLimitOrder(): boolean {
    return OrderType.Limit === this.type;
  }

  public isMarketOrder(): boolean {
    return OrderType.Market === this.type;
  }

  public isUsingTotal(): boolean {
    return this.isMarketOrder() && new BigNumber(this.total || '0').gt('0');
  }

  public getMatchableTotal(): string {
    return this.getAmountExcludedFee(this.total);
  }

  public getOppositeSide(): OrderSide {
    return this.isBuyOrder() ? OrderSide.Sell : OrderSide.Buy;
  }
  public canMatching(maxTotal = new BigNumber('0')): boolean {
    if (this.isUsingTotal()) {
      return !isEqual(maxTotal, '0');
    } else {
      return new BigNumber(this.remaining_amount).comparedTo('0') > 0;
    }
  }
  public canBeMatchedWith(order: OrderEntity): boolean {
    if (this.side === order.side) {
      return false;
    }

    if (!this.price || !order.price) {
      throw new Error(`Price cannot be empty ${this}, ${order}`);
    }

    // market price is limited by slippage, so we check price only
    // if (this.isMarketOrder() || order.isMarketOrder()) {
    //   return true;
    // }

    if (this.isBuyOrder() && new BigNumber(this.price).comparedTo(order.price) >= 0) {
      return true;
    }

    if (this.isSellOrder() && new BigNumber(this.price).comparedTo(order.price) <= 0) {
      return true;
    }

    return false;
  }

  public isExpired(): boolean {
    return this.expiry < Date.now() / 1000;
  }

  public updateStellarAmountIfNeeded(newAmount: string): void {
    if (new BigNumber(newAmount).comparedTo(this.amount) > 0) {
      this.amount = newAmount;
    }
  }

  public toString(): string {
    return (
      `Order{id=${this.id}, side='${this.side}', type='${this.type}', price=${this.price}, ` +
      `quantity=${this.amount}, remaining=${this.remaining_amount}, total=${this.total}, ` +
      `updatedAt=${this.updated_at}}, expiry=${this.expiry}`
    );
  }

  public updateStatusIfNeed(): OrderStatus {
    this.status = OrderEntity.getOrderStatus(this);
    return this.status;
  }

  public static getOrderStatus(order: OrderEntity): number {
    if (new BigNumber(order.filled_amount).isEqualTo('0')) return OrderStatus.Fillable;
    if (order.isUsingTotal()) {
      if (isEqual(new BigNumber(order.filled_amount).times(order.average).toString(), order.total)) {
        return OrderStatus.Fulfill;
      } else {
        return OrderStatus.PartiallyFilled;
      }
    } else {
      if (new BigNumber(order.remaining_amount).isEqualTo('0')) return OrderStatus.Fulfill;
      return OrderStatus.Filling;
    }
  }
}
