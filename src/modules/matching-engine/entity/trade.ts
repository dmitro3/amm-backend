import { OrderEntity } from 'src/models/entities/order.entity';
import { BigNumber } from '@0x/utils';
import { Comparable } from 'src/modules/matching-engine/entity/comparable';
import { isEqual } from 'src/modules/matching-engine/util/helper';
import { Objects } from 'src/modules/matching-engine/util/objects';

export class Trade implements Comparable {
  private _buyOrder: OrderEntity;
  private _sellOrder: OrderEntity;
  private _quantity: BigNumber;
  private _price: BigNumber;
  private readonly _buyerIsTaker: boolean;

  constructor(
    buyOrder: OrderEntity,
    sellOrder: OrderEntity,
    price: BigNumber,
    quantity: BigNumber,
    buyerIsTaker: boolean,
  ) {
    this._buyOrder = buyOrder;
    this._sellOrder = sellOrder;
    this._price = price;
    this._quantity = quantity;
    this._buyerIsTaker = buyerIsTaker;
  }

  get buyerIsTaker(): boolean {
    return this._buyerIsTaker;
  }

  get buyOrder(): OrderEntity {
    return this._buyOrder;
  }

  set buyOrder(value: OrderEntity) {
    this._buyOrder = value;
  }

  get sellOrder(): OrderEntity {
    return this._sellOrder;
  }

  set sellOrder(value: OrderEntity) {
    this._sellOrder = value;
  }

  get quantity(): BigNumber {
    return this._quantity;
  }

  set quantity(value: BigNumber) {
    this._quantity = value;
  }

  get price(): BigNumber {
    return this._price;
  }

  set price(value: BigNumber) {
    this._price = value;
  }
  public toString(): string {
    return `Trade{buyOrder=${this.buyOrder.id}, sellOrder=${this.sellOrder.id}, quantity=${this.quantity}, price=${this.price}}`;
  }

  public equals(o: Comparable): boolean {
    if (this === o) return true;
    if (!o || !(o instanceof Trade)) return false;
    const that = o as Trade;
    return (
      Objects.equals(this._buyOrder, that._buyOrder) &&
      Objects.equals(this._sellOrder, that._sellOrder) &&
      isEqual(this._quantity, that._quantity) &&
      this._price.eq(that._price) &&
      this._buyerIsTaker === that._buyerIsTaker
    );
  }
}
