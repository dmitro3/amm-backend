import { Global, Module, CacheModule as CacheMdl, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { redisConfig } from 'src/configs/redis.config';

@Global()
@Module({
  imports: [
    CacheMdl.registerAsync({
      useFactory: () => redisConfig,
    }),
  ],
  providers: [{ provide: CACHE_MANAGER, useValue: new Cache() }],
  exports: [CACHE_MANAGER],
})
export class CacheModule {}
