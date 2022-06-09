import { Emitter } from '@socket.io/redis-emitter';
import { createClient } from 'redis';
import { redisConfig } from 'src/configs/redis.config';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrderbookUpdates } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { OrderEntity } from 'src/models/entities/order.entity';
import { Emitter as IEmitter } from 'src/modules/matching-engine/util/emitter';
import { Logger } from '@nestjs/common';
import { WrapPool } from 'src/modules/pools/dto/wrap-pool.dto';
import { Ticker } from 'src/modules/ticker/ticker.interface';

export class SocketEmitter implements IEmitter {
  private static instance: SocketEmitter;
  public io;
  private logger: Logger;

  private constructor() {
    const redisClient = createClient(redisConfig.port, redisConfig.host);
    this.io = new Emitter(redisClient);
    this.logger = new Logger(SocketEmitter.name);
  }

  public static getInstance(): SocketEmitter {
    if (!SocketEmitter.instance) {
      SocketEmitter.instance = new SocketEmitter();
    }
    return SocketEmitter.instance;
  }

  public emitTrades(trades: TradeEntity[], pairId: number): void {
    this.io.emit(`trades_${pairId}`, trades);
  }

  public emitSwaps(swaps: WrapPool[], pairId: number): void {
    this.io.emit(`swaps_${pairId}`, swaps);
  }

  public emit24hTicker(tickers: Ticker[]): void {
    this.io.emit('24hTicker', tickers);
  }
  public emitPools(trades: TradeEntity[], pairId: number): void {
    this.io.emit(`pools_${pairId}`, trades);
  }

  public emitOrderbook(updates: OrderbookUpdates, pairId: number): void {
    this.io.emit(`orderbook_${pairId}`, updates);
  }

  public emitStellarOrderbook(pairId: number): void {
    this.io.emit(`stellar_orderbook_${pairId}`, {});
  }

  public emitTradingFee(): void {
    this.io.emit(`trading_fee`, {});
  }

  public emitOrders(orders: OrderEntity[], clientId: string | undefined): void {
    if (orders.length === 0) return;

    if (clientId) {
      this.logger.log(`Emit orders to client id: ${clientId}`);
      this.io.to(clientId).emit(`orders`, orders);
    } else {
      this.logger.log(`Cannot find socket id`);
    }
  }

  public emitUpdatedTrades(clientId: string | undefined): void {
    if (clientId) {
      this.logger.log(`Emit orders to client id: ${clientId}`);
      this.io.to(clientId).emit(`trades_updated`, {});
    } else {
      this.logger.log(`Cannot find socket id`);
    }
  }
}
