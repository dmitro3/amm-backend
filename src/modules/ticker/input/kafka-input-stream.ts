import { BaseInputStream } from 'src/modules/matching-engine/input/base-input-stream';
import { kafka } from 'src/configs/kafka';
import { Consumer } from 'kafkajs';
import { TickerTrade } from 'src/modules/ticker/ticker.interface';
import { Logger } from '@nestjs/common';

export class KafkaInputStream extends BaseInputStream<TickerTrade> {
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
        const trades = JSON.parse(message.value.toString());
        for (const trade of trades) {
          this.callback(trade);
        }
      },
    });
  }

  public static getTopic(pairId: number): string {
    return `ticker_${pairId}`;
  }
}
