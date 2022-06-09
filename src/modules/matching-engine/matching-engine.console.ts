import { Command, Console } from 'nestjs-console';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MatchingEngineConfig } from 'src/modules/matching-engine/engine/matching-engine-config';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { OutputDriver } from 'src/modules/matching-engine/enum/output-driver';
import { MatchingEngine } from 'src/modules/matching-engine/engine/matching-engine';
import { RedisOrderbookStream } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { KafkaInputStream } from 'src/modules/matching-engine/input/kafka-input-stream';
import { OrdersService } from 'src/modules/orders/orders.service';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OrderOutputStream } from 'src/modules/matching-engine/output/order-output-stream';
import { TradeService } from 'src/modules/trades/trades.service';

@Console()
@Injectable()
export class MatchingEngineConsole {
  constructor(
    private readonly orderService: OrdersService,
    private readonly tradeService: TradeService,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {}

  @Command({
    command: 'start-matching-engine <pairId>',
  })
  async startEngine(pairId: number): Promise<void> {
    const config: MatchingEngineConfig = new MatchingEngineConfig(
      InputDriver.Kafka,
      OutputDriver.List,
      OutputDriver.Redis,
    );
    config.orderInputQueueName = KafkaInputStream.getTopic(pairId);
    config.orderOutputStream = new OrderOutputStream(
      SocketEmitter.getInstance(),
      this.tradeService,
      this.orderService,
      pairId,
    );
    config.orderbookOutputStream = new RedisOrderbookStream(pairId, this.cacheManager, SocketEmitter.getInstance());
    const matchingEngine: MatchingEngine = new MatchingEngine();
    await matchingEngine.initialize(config);
    const fillableOrders = await this.orderService.getFillableOrders(pairId);
    await matchingEngine.preProcess(fillableOrders.map((order) => new OrderInput(OrderInputAction.Create, order)));
    await matchingEngine.start();
  }
}
