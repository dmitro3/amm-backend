export class AsyncBlockingQueue<T> {
  private resolvers: ((t: T) => void)[] = [];
  private promises: Promise<T>[] = [];
  constructor() {
    this.resolvers = [];
    this.promises = [];
  }

  private push(): void {
    this.promises.push(
      new Promise((resolve: (t: T) => void) => {
        this.resolvers.push(resolve);
      }),
    );
  }

  public enqueue(t: T): void {
    if (!this.resolvers.length) this.push();
    this.resolvers.shift()(t);
  }

  public dequeue(): Promise<T> {
    if (!this.promises.length) this.push();
    return this.promises.shift();
  }

  public isEmpty(): boolean {
    return this.promises.length === 0;
  }
}
