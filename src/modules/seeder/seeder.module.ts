import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { SeederConsole } from 'src/modules/seeder/seeder.console';
import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PairRepository, CoinRepository, FunctionalCurrencyRepository], 'master'),
    TradingFeeModule,
  ],
  providers: [SeederConsole, Logger],
  controllers: [],
})
export class SeederModule {}
