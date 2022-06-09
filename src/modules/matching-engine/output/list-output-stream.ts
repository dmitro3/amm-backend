import { BaseOutputStream } from 'src/modules/matching-engine/output/base-output-stream';

export class ListOutputStream<T> extends BaseOutputStream<T> {
  private data: T[] = [];

  public getData(): T[] {
    return this.data;
  }

  public connect(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async publish(t: T): Promise<void> {
    this.data.push(t);
  }
}
