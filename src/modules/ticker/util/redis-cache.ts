import { Cache } from 'cache-manager';
import { Redis } from 'ioredis';
import { Cache as CacheInterface } from 'src/modules/ticker/util/cache';

export class RedisCache implements CacheInterface {
  protected cache: Cache;
  protected redis: Redis;

  constructor(cacheManager: Cache, redis: Redis) {
    this.cache = cacheManager;
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | undefined> {
    return await this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<T> {
    return await this.cache.set(key, value, { ttl: ttl });
  }

  // eslint-disable-next-line
  async mSet(data: { key: string; value: any; ttl: number }[]): Promise<void> {
    const pipeline = await this.redis.pipeline();
    for (const record of data) {
      pipeline.setex(record.key, record.ttl, JSON.stringify(record.value));
    }
    await pipeline.exec();
  }
}
