import { forwardRef, Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { WalletController } from 'src/modules/wallets/wallet.controller';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { Coin } from 'src/models/entities/coin.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { WalletConsole } from 'src/modules/wallets/wallet.console';
import { LatestBlockModule } from 'src/modules/latest-block/latest-block.module';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { PairService } from 'src/modules/pairs/pair.service';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { CoinRepository } from 'src/models/repositories/coin.repository';

@Module({
  providers: [WalletService, WalletConsole, Logger, HistoryLogService, PairService],
  controllers: [WalletController],
  exports: [WalletService, HistoryLogService],
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Coin, WalletRepository, HistoryLogRepository, PairRepository, CoinRepository], 'master'),
    TypeOrmModule.forFeature(
      [Coin, WalletRepository, HistoryLogRepository, UserRepository, PairRepository, CoinRepository],
      'report',
    ),
    LatestBlockModule,
  ],
})
export class WalletModule {}
