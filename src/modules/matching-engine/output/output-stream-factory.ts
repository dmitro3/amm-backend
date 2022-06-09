import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OutputStream } from 'src/modules/matching-engine/output/output-stream';
import { MatchingEngineConfig } from 'src/modules/matching-engine/engine/matching-engine-config';
import { OutputDriver } from 'src/modules/matching-engine/enum/output-driver';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';

export class OutputStreamFactory {
  public static createOrderOutputStream(config: MatchingEngineConfig): OutputStream<OrderOutput> {
    switch (config.orderOutputDriver) {
      case OutputDriver.List:
        return config.orderOutputStream;
      default:
        throw new Error(`Unknown order output driver: ${config.orderOutputDriver}`);
    }
  }

  public static createOrderbookOutputStream(config: MatchingEngineConfig): OutputStream<OrderbookOutput> {
    switch (config.orderbookOutputDriver) {
      case OutputDriver.List:
      case OutputDriver.Redis:
        return config.orderbookOutputStream;
      default:
        throw new Error(`Unknown orderbook output driver: ${config.orderbookOutputDriver}`);
    }
  }
}
