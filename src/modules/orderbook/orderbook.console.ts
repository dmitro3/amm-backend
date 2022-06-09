import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { subscribeKafka } from 'src/shares/helpers/kafka';
import { KafkaGroup, KafkaTopic } from 'src/shares/enums/kafka';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { sleep } from 'src/shares/helpers/utils';

@Console()
@Injectable()
export class OrderbookConsole {
  private orderbookStatuses: { [key: string]: boolean } = {};

  constructor(private readonly logger: Logger) {
    this.logger.setContext(OrderbookConsole.name);
  }

  @Command({
    command: 'emit-stellar-orderbook',
    description: 'Emit Stellar orderbook',
  })
  public async emitStellarOrderbook(): Promise<void> {
    const consumer = await subscribeKafka(KafkaGroup.StellarOrderbook, KafkaTopic.StellarOrderbook);
    await consumer.run({
      eachMessage: async ({ message }) => {
        const pairId = message.value.toString();
        this.logger.log(`Got pair ${pairId}`);
        this.orderbookStatuses[pairId] = true;
      },
    });
    await this.emitOrderbookIfNeeded();
  }

  private async emitOrderbookIfNeeded(): Promise<void> {
    while (true) {
      for (const pairId in this.orderbookStatuses) {
        if (this.orderbookStatuses[pairId]) {
          this.orderbookStatuses[pairId] = false;
          SocketEmitter.getInstance().emitStellarOrderbook(Number(pairId));
        }
      }
      await sleep(1000);
    }
  }
}
