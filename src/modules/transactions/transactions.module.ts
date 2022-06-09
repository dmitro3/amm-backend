import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignerConsole } from 'src/modules/transactions/signer-console';
import { SenderConsole } from 'src/modules/transactions/sender-console';
import { PickerConsole } from 'src/modules/transactions/picker-console';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { OrdersService } from 'src/modules/orders/orders.service';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { TradingFeeModule } from 'src/modules/tradingfee/tradingfee.module';
import { VerifierConsole } from 'src/modules/transactions/verifier-console';
import { PairService } from 'src/modules/pairs/pair.service';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { TradesModule } from 'src/modules/trades/trades.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TradeRepository, TransactionRepository, OrderRepository, PairRepository, CoinRepository, WalletRepository],
      'master',
    ),
    TypeOrmModule.forFeature(
      [TradeRepository, TransactionRepository, OrderRepository, PairRepository, CoinRepository, WalletRepository],
      'report',
    ),
    Logger,
    TradingFeeModule,
    TradesModule,
  ],
  providers: [
    PairService,
    TransactionsService,
    OrdersService,
    Logger,
    SignerConsole,
    SenderConsole,
    PickerConsole,
    VerifierConsole,
  ],
  controllers: [],
  exports: [TransactionsService, OrdersService],
})
export class TransactionsModule {}
