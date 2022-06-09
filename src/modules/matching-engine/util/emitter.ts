import { OrderbookUpdates } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrderEntity } from 'src/models/entities/order.entity';

export interface Emitter {
  emitOrderbook: (data: OrderbookUpdates, pairId: number) => void;
  emitTrades: (data: TradeEntity[], pairId: number) => void;
  emitOrders: (data: OrderEntity[], socketId: string | undefined) => void;
}
