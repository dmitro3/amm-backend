import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { TICKERS } from 'src/modules/cache/cache.constant';
import { Ticker } from 'src/modules/ticker/ticker.interface';

@Injectable()
export class TickerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get24hTicker(): Promise<Ticker[]> {
    return await this.cacheManager.get(TICKERS);
  }
}
