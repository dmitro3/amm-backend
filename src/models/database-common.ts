import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { ConfigRepository } from 'src/models/repositories/config.repository';
import { FunctionalCurrencyUserRepository } from 'src/models/repositories/functional-currency-user.repository';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { IntervalSettingRepository } from 'src/models/repositories/interval-settings.repository';
import { LatestBlockRepository } from 'src/models/repositories/latest-block.repository';
import { NotificationRepository } from 'src/models/repositories/nofitication.respository';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { PoolCoinRepository } from 'src/models/repositories/pool-coins.repository';
import { PoolRepository } from 'src/models/repositories/pool.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { TradingFeeRepository } from 'src/models/repositories/trading-fee.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';

const commonRepositories = [
  CoinRepository,
  ConfigRepository,
  FunctionalCurrencyUserRepository,
  FunctionalCurrencyRepository,
  HistoryLogRepository,
  IntervalSettingRepository,
  LatestBlockRepository,
  NotificationRepository,
  OrderRepository,
  PairRepository,
  PnlRepository,
  PoolCoinRepository,
  PoolRepository,
  TradeRepository,
  TradingFeeRepository,
  TransactionRepository,
  UserRepository,
  WalletRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(commonRepositories, 'master'),
    TypeOrmModule.forFeature(commonRepositories, 'report'),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseCommonModule {}
