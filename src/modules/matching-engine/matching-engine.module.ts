import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { redisConfig } from 'src/configs/redis.config';
import { MatchingEngineConsole } from 'src/modules/matching-engine/matching-engine.console';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { TradesModule } from 'src/modules/trades/trades.module';

@Module({
  providers: [MatchingEngineConsole],
  controllers: [],
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
    OrdersModule,
    TradesModule,
  ],
})
export class MatchingEngineModule {}
