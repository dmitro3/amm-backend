import { Emitter } from 'src/modules/matching-engine/util/emitter';

export class BaseEmitter implements Emitter {
  private static instance: BaseEmitter;

  public static getInstance(): BaseEmitter {
    if (!BaseEmitter.instance) {
      BaseEmitter.instance = new BaseEmitter();
    }
    return BaseEmitter.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public emitTrades(): void {}

  // public emit24hTicker(): void {
  //   this.io.emit('24hTicker', tradeChanges);
  // }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public emitOrderbook(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public emitOrders(): void {}
}
