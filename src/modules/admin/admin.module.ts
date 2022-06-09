import { FunctionalCurrencyModule } from 'src/modules/functional-currency/functional-currency.module';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { MiscModule } from 'src/modules/misc/misc.module';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisConfig } from 'src/configs/redis.config';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';
import { IntervalSettingRepository } from 'src/models/repositories/interval-settings.repository';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { AdminController } from 'src/modules/admin/admin.controller';
import { UserWalletAdminController } from 'src/modules/admin/admin.controller.user-wallet';
import { AdminService } from 'src/modules/admin/admin.services';
import { jwtConstants } from 'src/modules/auth/constants';
import { CoinModule } from 'src/modules/coins/coin.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { PoolsModule } from 'src/modules/pools/pools.module';
import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';
import { UsersService } from 'src/modules/users/users.service';
import { WalletModule } from 'src/modules/wallets/wallet.module';
import { ConfigIntervalRepository } from 'src/models/repositories/config-interval.respository';
import { OrdersModule } from 'src/modules/orders/orders.module';
import { TradesModule } from 'src/modules/trades/trades.module';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { MiscService } from 'src/modules/misc/misc.service';
import * as redisStore from 'cache-manager-redis-store';
import { HistoryLogModule } from '../history-log/history-log.module';
import { PoolPnlRepository } from 'src/models/repositories/pool_pnl.repository';
import { NotificationModule } from 'src/modules/notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        UserRepository,
        FunctionalCurrencyUsers,
        IntervalSettingRepository,
        ConfigIntervalRepository,
        WalletRepository,
        TradeRepository,
        FunctionalCurrencyRepository,
        HistoryLogRepository,
      ],
      'master',
    ),
    TypeOrmModule.forFeature(
      [
        UserRepository,
        FunctionalCurrencyUsers,
        PnlRepository,
        IntervalSettingRepository,
        ConfigIntervalRepository,
        WalletRepository,
        OrderRepository,
        TradeRepository,
        FunctionalCurrencyRepository,
        HistoryLogRepository,
        PoolPnlRepository,
      ],
      'report',
    ),
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
    MailModule,
    WalletModule,
    NotificationModule,
    CoinModule,
    PoolsModule,
    OrdersModule,
    TradesModule,
    TradingFeeModule,
    FunctionalCurrencyModule,
    MiscModule,
    HistoryLogModule,
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: jwtConstants.accessTokenExpiry },
    }),
  ],
  controllers: [AdminController, UserWalletAdminController],
  providers: [UsersService, AdminService, MiscService],
  exports: [AdminService],
})
export class AdminModule {}
