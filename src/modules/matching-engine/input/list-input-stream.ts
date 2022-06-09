import { BaseInputStream } from 'src/modules/matching-engine/input/base-input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';

export class ListInputStream extends BaseInputStream<OrderInput> {
  private _data: OrderInput[];

  constructor(data: OrderInput[]) {
    super();
    this._data = data;
  }

  get data(): OrderInput[] {
    return this._data;
  }

  set data(value: OrderInput[]) {
    this._data = value;
  }

  connect(): void {
    setTimeout(() => {
      if (!this.callback) {
        return;
      }

      for (const action of this._data) {
        this.callback(action);
      }
    }, 0);
  }
}
