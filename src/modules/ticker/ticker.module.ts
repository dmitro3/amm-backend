import { CacheModule, Logger, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { OrderbookModule } from 'src/modules/orderbook/orderbook.module';
import { TickerConsole } from 'src/modules/ticker/ticker.console';
import { TickerController } from 'src/modules/ticker/ticker.controller';
import { TickerService } from 'src/modules/ticker/ticker.service';
import { TradesModule } from 'src/modules/trades/trades.module';
import { RedisModule } from 'nestjs-redis';
import { redisConfig } from 'src/configs/redis.config';
import { REDIS_CONFIG_NAME, REDIS_DB } from 'src/modules/ticker/ticker.constant';
import { PairModule } from 'src/modules/pairs/pair.module';
import { DatabaseCommonModule } from 'src/models/database-common';

@Module({
  imports: [
    DatabaseCommonModule,
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
      db: REDIS_DB,
    }),
    RedisModule.register({ ...redisConfig, db: REDIS_DB, name: REDIS_CONFIG_NAME }),
    TradesModule,
    PairModule,
    OrderbookModule,
  ],
  providers: [TickerConsole, TickerService, Logger],
  controllers: [TickerController],
})
export class TickerModule {}
