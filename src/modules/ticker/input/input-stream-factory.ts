import { InputStream } from 'src/modules/matching-engine/input/input-stream';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { TickerEngineConfig } from 'src/modules/ticker/engine/ticker-engine-config';
import { TickerTrade } from 'src/modules/ticker/ticker.interface';
import { KafkaInputStream } from 'src/modules/ticker/input/kafka-input-stream';

export class InputStreamFactory {
  public static createInputStream(config: TickerEngineConfig): InputStream<TickerTrade> {
    switch (config.inputDriver) {
      case InputDriver.List:
        return config.inputStream;
      case InputDriver.Kafka:
        return new KafkaInputStream(config.inputQueueName);
      default:
        throw new Error(`Unknown ticker input driver ${config.inputDriver}`);
    }
  }
}
