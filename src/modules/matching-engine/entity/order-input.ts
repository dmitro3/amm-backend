import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { OrderEntity } from 'src/models/entities/order.entity';
import { Comparable } from 'src/modules/matching-engine/entity/comparable';
import { Objects } from 'src/modules/matching-engine/util/objects';

export class OrderInput implements Comparable {
  private _action: OrderInputAction;
  private _order: OrderEntity;

  constructor(action: OrderInputAction, order: OrderEntity) {
    this._action = action;
    this._order = order;
  }

  get action(): OrderInputAction {
    return this._action;
  }

  set action(value: OrderInputAction) {
    this._action = value;
  }

  get order(): OrderEntity {
    return this._order;
  }

  set order(value: OrderEntity) {
    this._order = value;
  }

  public isActionCreate(): boolean {
    return OrderInputAction.Create === this._action;
  }

  public isActionCancel(): boolean {
    return OrderInputAction.Cancel === this._action;
  }

  public equals(o: Comparable): boolean {
    if (this === o) return true;
    if (!o || !(o instanceof OrderInput)) return false;
    const that = o as OrderInput;
    return this._action === that._action && Objects.equals(this._order, that._order);
  }

  public toString(): string {
    return `OrderInput{action='${this._action}', order=${this._order}`;
  }
}
