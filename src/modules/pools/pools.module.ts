import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { LatestBlockModule } from 'src/modules/latest-block/latest-block.module';
import { PoolConsole } from 'src/modules/pools/pools.console';
import { PoolsService } from 'src/modules/pools/pools.service';
import { PoolRepository } from 'src/models/repositories/pool.repository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { TradesModule } from 'src/modules/trades/trades.module';
import { PoolsController } from 'src/modules/pools/pools.controller';
import { PoolCoinRepository } from 'src/models/repositories/pool-coins.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        PoolRepository,
        PairRepository,
        CoinRepository,
        TradeRepository,
        OrderRepository,
        WalletRepository,
        PoolCoinRepository,
      ],
      'master',
    ),
    TypeOrmModule.forFeature(
      [
        PoolRepository,
        PairRepository,
        CoinRepository,
        TradeRepository,
        OrderRepository,
        WalletRepository,
        PoolCoinRepository,
      ],
      'report',
    ),
    TradesModule,
    LatestBlockModule,
  ],
  providers: [PoolConsole, PoolsService],
  exports: [PoolsService],
  controllers: [PoolsController],
})
export class PoolsModule {}
