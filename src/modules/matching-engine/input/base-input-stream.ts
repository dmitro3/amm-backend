import { InputStream } from 'src/modules/matching-engine/input/input-stream';

export abstract class BaseInputStream<T> implements InputStream<T> {
  protected callback: (data: T) => void;

  abstract connect(): void;

  public setOnNewDataCallback(callback: (data: T) => void): void {
    this.callback = callback;
  }
}
