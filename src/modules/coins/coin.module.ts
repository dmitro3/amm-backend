import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinService } from './coin.service';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { CoinController } from './coin.controller';
import { CalculateBalances } from 'src/modules/coins/calculate-balances.cron';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';

@Module({
  providers: [CoinService, CalculateBalances],
  controllers: [CoinController],
  imports: [
    TypeOrmModule.forFeature([CoinRepository, PnlRepository], 'master'),
    TypeOrmModule.forFeature([CoinRepository, UserRepository, WalletRepository], 'report'),
  ],
  exports: [CoinService],
})
export class CoinModule {}
