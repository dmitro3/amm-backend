import { BaseInputStream } from 'src/modules/matching-engine/input/base-input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { kafka } from 'src/configs/kafka';
import { Consumer } from 'kafkajs';
import { plainToClass } from 'class-transformer';
import { OrderEntity } from 'src/models/entities/order.entity';
import { Logger } from '@nestjs/common';

export class KafkaInputStream extends BaseInputStream<OrderInput> {
  private readonly topic: string;
  private consumer: Consumer;
  private logger = new Logger(KafkaInputStream.name);

  constructor(topic: string) {
    super();
    this.topic = topic;
    this.consumer = kafka.consumer({ groupId: topic });
  }

  async connect(): Promise<void> {
    if (!this.callback) {
      return;
    }

    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        this.logger.log(`Got message from ${topic}`);
        const data = JSON.parse(message.value.toString());
        const orderInput: OrderInput = new OrderInput(data._action, plainToClass(OrderEntity, data._order));
        this.callback(orderInput);
      },
    });
  }

  public static getTopic(pairId: number): string {
    return `process_order_${pairId}`;
  }
}
