import { CacheModule, Global, Module } from '@nestjs/common';
import { redisConfig } from 'src/configs/redis.config';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      ...redisConfig,
    }),
  ],
  exports: [CacheModule],
})
export class GlobalsModule {}
