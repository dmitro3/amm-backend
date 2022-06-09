// eslint-disable-next-line
const StellarSdk = require('stellar-sdk');
import { Transaction } from 'stellar-sdk';
// eslint-disable-next-line
const Web3 = require('web3');
import * as EthereumTx from 'ethereumjs-tx';
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
export class SignerConsole {
  private web3;
  private readonly stellarSourceKey;
  constructor(
    private readonly tradeService: TradeService,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SignerConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
    const stellarExchangeSecret = getConfig().get<string>('stellar_exchange_secret');
    this.stellarSourceKey = StellarSdk.Keypair.fromSecret(stellarExchangeSecret);
  }

  async signTxt(contractTxt: TransactionEntity): Promise<void> {
    const matcherPrivateKey = getConfig().get<string>('matcher_private_key');

    const tx = new EthereumTx(contractTxt.signed_transaction);
    const privateKey = Buffer.from(matcherPrivateKey, 'hex');
    tx.sign(privateKey);

    contractTxt.status = TransactionStatus.Signed;
    contractTxt.txid = `0x${tx.hash().toString('hex')}`;
    contractTxt.signed_transaction = tx.serialize().toString('hex');
    contractTxt.updated_at = new Date();
    await this.transactionService.updateTransaction(contractTxt);
  }

  async signStellarTx(unsignedTxt: TransactionEntity): Promise<void> {
    const stellarNetworkPassphrase = config.get<string>('stellar_network_passphrase');
    const tx = new Transaction(unsignedTxt.signed_transaction, stellarNetworkPassphrase);
    await tx.sign(this.stellarSourceKey);

    unsignedTxt.txid = `${tx.hash().toString('hex')}`;
    unsignedTxt.signed_transaction = tx.toEnvelope().toXDR().toString('base64');
    unsignedTxt.status = TransactionStatus.Signed;
    unsignedTxt.updated_at = new Date();

    await this.transactionService.updateTransaction(unsignedTxt);
  }

  @Command({
    command: 'sign-txs',
    description: 'sign trades',
  })
  async signTrades(): Promise<void> {
    while (true) {
      const unsignedTxt = await this.transactionService.getOneUnsignedTxt(Network.BSC);
      if (unsignedTxt) {
        await this.signTxt(unsignedTxt);
      } else {
        this.logger.log('No unsigned contract transaction for sign. Waiting for next....');
        await sleep(1000);
      }
    }
  }

  @Command({
    command: 'sign-txs-stellar',
    description: 'sign transactions on stellar',
  })
  async signStellarTxs(): Promise<void> {
    while (true) {
      const unsignedTxt = await this.transactionService.getOneUnsignedTxt(Network.Stellar);
      if (unsignedTxt) {
        await this.signStellarTx(unsignedTxt);
      } else {
        this.logger.log('No unsigned stellar transaction for sign. Waiting for next....');
        await sleep(1000);
      }
    }
  }
}
