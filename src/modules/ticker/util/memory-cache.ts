import { Cache as CacheInterface } from 'src/modules/ticker/util/cache';
import { Cache } from 'cache-manager';

export class MemoryCache implements CacheInterface {
  protected cache: Cache;

  constructor(cacheManager: Cache) {
    this.cache = cacheManager;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<T> {
    return await this.cache.set(key, value, { ttl });
  }

  // eslint-disable-next-line
  async mSet(data: { key: string; value: any; ttl: number }[]): Promise<void> {
    for (const record of data) {
      await this.cache.set(record.key, record.value, { ttl: record.ttl });
    }
  }
}
