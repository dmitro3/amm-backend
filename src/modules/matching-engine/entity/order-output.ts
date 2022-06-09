import { OrderOutputAction } from 'src/modules/matching-engine/enum/order-output-action';
import { OrderEntity } from 'src/models/entities/order.entity';
import { Trade } from 'src/modules/matching-engine/entity/trade';
import { Comparable } from 'src/modules/matching-engine/entity/comparable';
import { Objects } from 'src/modules/matching-engine/util/objects';

export class OrderOutput implements Comparable {
  private _action: OrderOutputAction;
  private _order: OrderEntity;
  private _trades: Trade[];

  constructor(action: OrderOutputAction, trades: Trade[], order: OrderEntity) {
    this._action = action;
    this._trades = trades;
    this._order = order;
  }

  get action(): OrderOutputAction {
    return this._action;
  }

  set action(value: OrderOutputAction) {
    this._action = value;
  }

  get order(): OrderEntity {
    return this._order;
  }

  set order(value: OrderEntity) {
    this._order = value;
  }

  get trades(): Trade[] {
    return this._trades;
  }

  set trades(value: Trade[]) {
    this._trades = value;
  }

  public equals(o: Comparable): boolean {
    if (this === o) return true;
    if (!o || !(o instanceof OrderOutput)) return false;
    const that = o as OrderOutput;

    if (this._action !== that._action) {
      return false;
    }
    if (!Objects.equals(this._order, that._order)) {
      return false;
    }
    if (this._trades.length !== that.trades.length) {
      return false;
    }
    for (let i = 0; i < this.trades.length; i++) {
      if (!Objects.equals(this._trades[i], that._trades[i])) {
        return false;
      }
    }

    return true;
  }

  public toString(): string {
    return `OrderOutput{action=${this._action}, order=${this._order}, trade=${this._trades}`;
  }
}
