// eslint-disable-next-line
const StellarSdk = require('stellar-sdk');
import { Server, Transaction } from 'stellar-sdk';
// eslint-disable-next-line
const Web3 = require('web3');
import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from 'src/configs';
import { TransactionEntity, TransactionStatus } from 'src/models/entities/transaction.entity';
import { TradeService } from 'src/modules/trades/trades.service';
import { sleep } from 'src/shares/helpers/utils';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { Network } from 'src/shares/enums/network';
import * as config from 'config';

@Console()
@Injectable()
export class SenderConsole {
  private web3;
  private stellarServer: Server;
  constructor(
    private readonly tradeService: TradeService,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SenderConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
    const stellarUrl = getConfig().get<string>('stellar_url');
    this.stellarServer = new StellarSdk.Server(stellarUrl);
  }

  async sendTxt(contractTx: TransactionEntity): Promise<void> {
    const receipt = await this.web3.eth.sendSignedTransaction(`0x${contractTx.signed_transaction}`);

    if (receipt) {
      contractTx.status = TransactionStatus.Sent;
    } else {
      contractTx.status = TransactionStatus.Failed;
    }

    contractTx.updated_at = new Date();
    await this.transactionService.updateTransaction(contractTx);
  }

  async sendStellarTx(signedTxt: TransactionEntity): Promise<void> {
    const stellarNetworkPassphrase = config.get<string>('stellar_network_passphrase');
    const tx = new Transaction(signedTxt.signed_transaction, stellarNetworkPassphrase);
    try {
      await this.stellarServer.submitTransaction(tx);
      signedTxt.status = TransactionStatus.Sent;
    } catch (error) {
      signedTxt.note = JSON.stringify(error);
      signedTxt.status = TransactionStatus.Failed;
    }
    signedTxt.updated_at = new Date();
    await this.transactionService.updateTransaction(signedTxt);
  }

  @Command({
    command: 'send-txs',
    description: 'send transactions',
  })
  async sendTxts(): Promise<void> {
    while (true) {
      const signedTxt = await this.transactionService.getOneSignedTxt(Network.BSC);
      if (signedTxt) {
        await this.sendTxt(signedTxt);
      } else {
        this.logger.log('No signed transaction for sign. Waiting for next....');
        await sleep(1000);
      }
    }
  }

  @Command({
    command: 'send-txs-stellar',
    description: 'send transactions stellar',
  })
  async sendStellarTxs(): Promise<void> {
    while (true) {
      const signedTx = await this.transactionService.getOneSignedTxt(Network.Stellar);
      if (signedTx) {
        await this.sendStellarTx(signedTx);
      } else {
        this.logger.log('No stellar signed transaction for sign. Waiting for next....');
        await sleep(1000);
      }
    }
  }
}
