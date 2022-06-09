// eslint-disable-next-line @typescript-eslint/no-var-requires
const FastPriorityQueueLib = require('fastpriorityqueue');

export class FastPriorityQueue<T> {
  private queue;

  constructor(comparator?: (a: T, b: T) => boolean) {
    this.queue = FastPriorityQueueLib(comparator);
  }

  public add(value: T): void {
    this.queue.add(value);
  }

  public removeOne(callback: (a: T) => boolean): T | undefined {
    return this.queue.removeOne(callback);
  }

  public isEmpty(): boolean {
    return this.queue.isEmpty();
  }

  public peek(): T | undefined {
    return this.queue.peek();
  }

  public poll(): T | undefined {
    return this.queue.poll();
  }

  public get size(): number {
    return this.queue.size;
  }
}
