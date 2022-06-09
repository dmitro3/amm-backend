import { BullModule } from '@nestjs/bull';
import { CacheModule, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { redisConfig } from 'src/configs/redis.config';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { LatestBlockModule } from 'src/modules/latest-block/latest-block.module';
import { OfferService } from 'src/modules/orders/offer.service';
import { OrdersController } from 'src/modules/orders/orders.controller';
import { OrdersService } from 'src/modules/orders/orders.service';
import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';
import { WalletModule } from 'src/modules/wallets/wallet.module';
import { OrdersConsole } from 'src/modules/orders/orders.console';
import { PairModule } from 'src/modules/pairs/pair.module';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';

@Module({
  providers: [OrdersService, OfferService, OrdersConsole, Logger],
  controllers: [OrdersController],
  imports: [
    BullModule.registerQueue({
      name: 'order',
    }),
    TypeOrmModule.forFeature(
      [OrderRepository, PairRepository, WalletRepository, CoinRepository, TransactionRepository],
      'master',
    ),
    TypeOrmModule.forFeature([OrderRepository, PairRepository, WalletRepository, CoinRepository], 'report'),
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
    LatestBlockModule,
    WalletModule,
    PairModule,
    TradingFeeModule,
  ],
  exports: [OrdersService, OfferService],
})
export class OrdersModule {}
