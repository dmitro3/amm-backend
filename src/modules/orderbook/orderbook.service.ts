import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Orderbook, RedisOrderbookStream } from 'src/modules/matching-engine/output/redis-orderbook-stream';

@Injectable()
export class OrderbookService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getOrderbook(pairId: number): Promise<Orderbook> {
    let orderbook: Orderbook = await this.cacheManager.get(RedisOrderbookStream.getOrderbookKey(pairId));
    if (!orderbook) {
      orderbook = {
        bids: [],
        asks: [],
        updated_at: 0,
      };
    }
    return orderbook;
  }
}
