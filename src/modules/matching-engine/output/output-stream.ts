export interface OutputStream<T> {
  connect(): Promise<boolean>;
  publish(t: T): void;
}
