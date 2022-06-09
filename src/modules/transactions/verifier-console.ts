// eslint-disable-next-line
const Web3 = require('web3');
import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from 'src/configs';
import { TransactionEntity, TransactionStatus } from 'src/models/entities/transaction.entity';
import { TradeService } from 'src/modules/trades/trades.service';
import { sleep } from 'src/shares/helpers/utils';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { CallApi } from 'src/shares/helpers/call-api.helper';
import * as config from 'config';
import { Network } from 'src/shares/enums/network';

@Console()
@Injectable()
export class VerifierConsole {
  private web3;
  constructor(
    private readonly tradeService: TradeService,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(VerifierConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
  }

  async verifyTx(tx: TransactionEntity): Promise<void> {
    const transaction = await this.web3.eth.getTransaction(tx.txid);
    if (!transaction) {
      tx.status = TransactionStatus.Failed;
    } else {
      tx.status = TransactionStatus.Complete;
    }
    await this.transactionService.updateTransaction(tx);
    await this.tradeService.updateTxid(tx.rawId, tx.txid);
  }

  async verifyStellarTx(sentTx: TransactionEntity): Promise<void> {
    const stellarUrl = config.get<string>('stellar_url');
    const stellarResponse = await CallApi(`${stellarUrl}/transactions/${sentTx.txid}/operations`, {}, 'GET');
    const operations = (await stellarResponse.json())._embedded?.records || null;

    if (!operations) {
      sentTx.status = TransactionStatus.Failed;
    } else {
      sentTx.status = TransactionStatus.Complete;
    }
    await this.transactionService.updateTransaction(sentTx);
  }

  @Command({
    command: 'verify-txs',
    description: 'verify transactions',
  })
  async verifyTxs(): Promise<void> {
    while (true) {
      const sentTx = await this.transactionService.getOneSentTx(Network.BSC);
      if (sentTx) {
        await this.verifyTx(sentTx);
      } else {
        this.logger.log('No sent transaction for verify. Waiting for next....');
        await sleep(1000);
      }
    }
  }

  @Command({
    command: 'verify-txs-stellar',
    description: 'verify transactions stellar',
  })
  async verifyStellarTxs(): Promise<void> {
    while (true) {
      const sentTx = await this.transactionService.getOneSentTx(Network.Stellar);
      if (sentTx) {
        await this.verifyStellarTx(sentTx);
      } else {
        this.logger.log('No stellar sent transaction for verify. Waiting for next....');
        await sleep(1000);
      }
    }
  }
}
