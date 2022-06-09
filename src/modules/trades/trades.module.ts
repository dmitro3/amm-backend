import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { LatestBlockModule } from 'src/modules/latest-block/latest-block.module';
import { PairModule } from 'src/modules/pairs/pair.module';
import { PairService } from 'src/modules/pairs/pair.service';
import { TradeConsoleService } from 'src/modules/trades/trades.console';
import { TradesController } from 'src/modules/trades/trades.controller';
import { TradeService } from 'src/modules/trades/trades.service';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { WalletModule } from 'src/modules/wallets/wallet.module';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TradeRepository, PairRepository, TransactionRepository, CoinRepository, WalletRepository],
      'master',
    ),
    TypeOrmModule.forFeature(
      [TradeRepository, PairRepository, TransactionRepository, CoinRepository, WalletRepository],
      'report',
    ),
    LatestBlockModule,
    PairModule,
    OrdersModule,
    WalletModule,
    Logger,
    TradingFeeModule,
    OrdersModule,
  ],
  providers: [TradeConsoleService, TradeService, PairService, Logger],
  controllers: [TradesController],
  exports: [TradeService],
})
export class TradesModule {}
