import { InputStream } from 'src/modules/matching-engine/input/input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { MatchingEngineConfig } from 'src/modules/matching-engine/engine/matching-engine-config';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { KafkaInputStream } from 'src/modules/matching-engine/input/kafka-input-stream';

export class InputStreamFactory {
  public static createInputStream(config: MatchingEngineConfig): InputStream<OrderInput> {
    switch (config.orderInputDriver) {
      case InputDriver.List:
        return config.orderInputStream;
      case InputDriver.Kafka:
        return new KafkaInputStream(config.orderInputQueueName);
      default:
        throw new Error(`Unknown order input driver ${config.orderInputDriver}`);
    }
  }
}
