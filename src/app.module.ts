import { BullModule } from '@nestjs/bull';
import { CacheModule, Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsoleModule } from 'nestjs-console';
import { HeaderResolver, I18nJsonParser, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { defaultConfig, masterConfig, reportConfig } from 'src/configs/database.config';
import { redisConfig } from 'src/configs/redis.config';
import { AdminModule } from 'src/modules/admin/admin.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigModule } from 'src/modules/configs/config.module';
import { FunctionalCurrencyModule } from 'src/modules/functional-currency/functional-currency.module';
import { HealthModule } from 'src/modules/healths/health.module';
import { LatestBlockModule } from 'src/modules/latest-block/latest-block.module';
import { LocationModule } from 'src/modules/location/location.module';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { PairModule } from 'src/modules/pairs/pair.module';
import { PoolsModule } from 'src/modules/pools/pools.module';
import { SeederModule } from 'src/modules/seeder/seeder.module';
import { TradesModule } from 'src/modules/trades/trades.module';
import { UsersModule } from 'src/modules/users/users.module';
import { WalletModule } from 'src/modules/wallets/wallet.module';
import { EXCLUDE_LOG_PATHS } from 'src/shares/constants/constant';
import { LoggerMiddleware } from 'src/shares/middlewares/logger.middleware';
import { ContractsModule } from 'src/modules/contracts/contracts.module';
import { MatchingEngineModule } from 'src/modules/matching-engine/matching-engine.module';
import { GlobalsModule } from 'src/shares/globals/globals.module';
import { CoinModule } from './modules/coins/coin.module';
import { EventsModule } from 'src/modules/events/events.module';
import { TickerModule } from 'src/modules/ticker/ticker.module';
import { OrderbookModule } from 'src/modules/orderbook/orderbook.module';
import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';
import { TransactionsModule } from 'src/modules/transactions/transactions.module';
import { MiscModule } from 'src/modules/misc/misc.module';
import { HistoryLogModule } from 'src/modules/history-log/history-log.module';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { GraduallyModule } from 'src/modules/gradually/gradually.module';

@Module({
  imports: [
    Logger,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(defaultConfig),
    TypeOrmModule.forRoot(masterConfig),
    TypeOrmModule.forRoot(reportConfig),
    BullModule.forRoot({
      redis: redisConfig,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, '/i18n/'),
      },
      resolvers: [new HeaderResolver(['x-custom-lang'])],
    }),
    CacheModule.registerAsync({
      useFactory: () => redisConfig,
    }),
    GraduallyModule,
    NotificationModule,
    ConsoleModule,
    SeederModule,
    EventsModule,
    OrdersModule,
    ConfigModule,
    AuthModule,
    HealthModule,
    PoolsModule,
    PairModule,
    UsersModule,
    FunctionalCurrencyModule,
    WalletModule,
    LocationModule,
    AdminModule,
    TradesModule,
    LatestBlockModule,
    ContractsModule,
    MatchingEngineModule,
    GlobalsModule,
    CoinModule,
    TickerModule,
    OrderbookModule,
    TradingFeeModule,
    TransactionsModule,
    MiscModule,
    HistoryLogModule,
  ],
  controllers: [],
  providers: [Logger],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .exclude(...EXCLUDE_LOG_PATHS)
      .forRoutes('/');
  }
}
