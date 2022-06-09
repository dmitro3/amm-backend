import { BaseInputStream } from 'src/modules/matching-engine/input/base-input-stream';

export class ListInputStream<T> extends BaseInputStream<T> {
  private _data: T[];

  constructor(data: T[]) {
    super();
    this._data = data;
  }

  get data(): T[] {
    return this._data;
  }

  set data(value: T[]) {
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
