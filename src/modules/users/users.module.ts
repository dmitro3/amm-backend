import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';
import { User } from 'src/models/entities/users.entity';
import { MailModule } from 'src/modules/mail/mail.module';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { WalletModule } from 'src/modules/wallets/wallet.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/modules/auth/constants';
import { UserAdminController } from 'src/modules//admin/admin.controller.user';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { FunctionalCurrencyModule } from 'src/modules/functional-currency/functional-currency.module';
import { UserRepository } from 'src/models/repositories/user.repository';
import { ConfigIntervalRepository } from 'src/models/repositories/config-interval.respository';
import { IntervalSettingRepository } from 'src/models/repositories/interval-settings.repository';
import { UsersConsole } from 'src/modules/users/users.console';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { MiscService } from 'src/modules/misc/misc.service';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { LatestBlockRepository } from 'src/models/repositories/latest-block.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { PairService } from 'src/modules/pairs/pair.service';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { PoolPnlRepository } from 'src/models/repositories/pool_pnl.repository';

@Module({
  imports: [
    Logger,
    TypeOrmModule.forFeature(
      [
        WalletRepository,
        IntervalSettingRepository,
        ConfigIntervalRepository,
        User,
        FunctionalCurrencyUsers,
        UserRepository,
        PnlRepository,
        LatestBlockRepository,
        PairRepository,
        CoinRepository,
        HistoryLogRepository,
        PoolPnlRepository,
      ],
      'master',
    ),
    TypeOrmModule.forFeature(
      [
        WalletRepository,
        IntervalSettingRepository,
        ConfigIntervalRepository,
        User,
        FunctionalCurrencyUsers,
        PnlRepository,
        UserRepository,
        CoinRepository,
        FunctionalCurrencyRepository,
        TradeRepository,
        OrderRepository,
        PairRepository,
        HistoryLogRepository,
        PoolPnlRepository,
      ],
      'report',
    ),
    MailModule,
    forwardRef(() => WalletModule),
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: jwtConstants.accessTokenExpiry },
    }),
    FunctionalCurrencyModule,
  ],
  providers: [UsersService, Logger, UsersConsole, MiscService, LatestBlockService, PairService],
  exports: [UsersService],
  controllers: [UsersController, UserAdminController],
})
export class UsersModule {}
