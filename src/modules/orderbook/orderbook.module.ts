import { CacheModule, Logger, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { redisConfig } from 'src/configs/redis.config';
import { OrderbookService } from 'src/modules/orderbook/orderbook.service';
import { OrderbookConsole } from 'src/modules/orderbook/orderbook.console';
import { OrderbookController } from 'src/modules/orderbook/orderbook.controller';
import { PairModule } from 'src/modules/pairs/pair.module';

@Module({
  providers: [OrderbookService, OrderbookConsole, Logger],
  controllers: [OrderbookController],
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
    PairModule,
  ],
  exports: [OrderbookService],
})
export class OrderbookModule {}
