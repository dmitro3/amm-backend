import { OutputStream } from 'src/modules/matching-engine/output/output-stream';

export abstract class BaseOutputStream<T> implements OutputStream<T> {
  abstract connect(): Promise<boolean>;
  abstract publish(t: T): void;
}
