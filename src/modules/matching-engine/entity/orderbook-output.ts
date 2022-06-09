import { Comparable } from 'src/modules/matching-engine/entity/comparable';
import { isEqual } from 'src/modules/matching-engine/util/helper';
import { OrderSide } from 'src/modules/orders/orders.const';

export class OrderbookOutput implements Comparable {
  public side: OrderSide;
  public price: string;
  public amount: string;

  constructor(side: OrderSide, price: string, amount: string) {
    this.side = side;
    this.price = price;
    this.amount = amount;
  }

  public equals(o: Comparable): boolean {
    if (this === o) return true;
    if (!o || !(o instanceof OrderbookOutput)) return false;
    const that = o as OrderbookOutput;
    return this.side === that.side && this.price === that.price && isEqual(this.amount, that.amount);
  }
}
