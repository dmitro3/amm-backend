// eslint-disable-next-line
const StellarSdk = require('stellar-sdk');
import { MatchType } from 'src/modules/transactions/interfaces';
import { Asset, Server } from 'stellar-sdk';
// eslint-disable-next-line
const Web3 = require('web3');
import { BigNumber } from '@0x/utils';
import * as EthereumTx from 'ethereumjs-tx';
import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from 'src/configs';
import { zeroExABI } from 'src/modules/contracts/abi/zeroExABI';
import { contractAddress, STELLAR_ACCEPT_NUMBER_OF_DECIMAL } from 'src/modules/orders/orders.const';
import { OrderEntity } from 'src/models/entities/order.entity';
import { TransactionEntity, TransactionStatus, TransactionTypes } from 'src/models/entities/transaction.entity';
import { TradeService } from 'src/modules/trades/trades.service';
import { PairService } from 'src/modules/pairs/pair.service';
import { createLimitOrder, sleep } from 'src/shares/helpers/utils';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { TransactionsService } from 'src/modules/transactions/transactions.service';
import { CallApi } from 'src/shares/helpers/call-api.helper';
import * as config from 'config';
import { Network } from 'src/shares/enums/network';
import {
  getBuyingAssetFromOperation,
  getSellingAssetFromOperation,
  isTargetAsset,
  isBaseAsset,
} from 'src/modules/orders/offer.helper';

@Console()
@Injectable()
export class PickerConsole {
  private web3;
  private stellarServer: Server;
  private stellarSourceKey;
  constructor(
    private readonly tradeService: TradeService,
    private readonly orderService: OrdersService,
    private readonly pairService: PairService,
    private readonly transactionService: TransactionsService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(PickerConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    const stellarExchangeSecret = getConfig().get<string>('stellar_exchange_secret');
    const stellarUrl = getConfig().get<string>('stellar_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
    this.stellarServer = new StellarSdk.Server(stellarUrl);
    this.stellarSourceKey = StellarSdk.Keypair.fromSecret(stellarExchangeSecret);
  }

  async pickTrade(trade: TradeEntity, txNoStatus: TransactionEntity): Promise<void> {
    const buyOrder = await this.orderService.getOrderById(trade.buy_order_id);
    const sellOrder = await this.orderService.getOrderById(trade.sell_order_id);

    const matcherAddress = getConfig().get<string>('matcher_address');
    const chainId = getConfig().get<number>('chain_id');
    const contract = new this.web3.eth.Contract(zeroExABI, contractAddress.exchangeProxy);
    const count = await this.web3.eth.getTransactionCount(matcherAddress);

    const limitLeftOrder = createLimitOrder(sellOrder, matcherAddress, chainId, contractAddress.exchangeProxy);
    const limitRightOrder = createLimitOrder(buyOrder, matcherAddress, chainId, contractAddress.exchangeProxy);
    const price = new BigNumber(10).pow(10).times(trade.price).toString();

    const _gasLimit = await contract.methods
      .matchOrders(
        JSON.parse(JSON.stringify(limitLeftOrder)),
        JSON.parse(JSON.stringify(limitRightOrder)),
        JSON.parse(sellOrder.signature),
        JSON.parse(buyOrder.signature),
        price,
        MatchType.Amount,
        MatchType.Amount,
      )
      .estimateGas({ from: matcherAddress });
    const gasLimit = this.web3.utils.toBN(_gasLimit);
    const gasPrice = this.web3.utils.toBN(await this.web3.eth.getGasPrice());

    const data = await contract.methods
      .matchOrders(
        JSON.parse(JSON.stringify(limitLeftOrder)),
        JSON.parse(JSON.stringify(limitRightOrder)),
        JSON.parse(sellOrder.signature),
        JSON.parse(buyOrder.signature),
        price,
        MatchType.Amount,
        MatchType.Amount,
      )
      .encodeABI();

    const tx = new EthereumTx({
      nonce: this.web3.utils.toHex(count),
      gasLimit: this.web3.utils.toHex(gasLimit),
      gasPrice: this.web3.utils.toHex(gasPrice),
      to: contractAddress.exchangeProxy,
      data: data,
    });

    txNoStatus.status = TransactionStatus.Unsigned;
    txNoStatus.txid = `0x${tx.hash().toString('hex')}`;
    txNoStatus.signed_transaction = tx.serialize().toString('hex');

    await this.transactionService.updateTransaction(txNoStatus);
  }

  async pickCancelOrder(order: OrderEntity, txNoStatus: TransactionEntity): Promise<void> {
    const matcherAddress = getConfig().get<string>('matcher_address');
    const count = await this.web3.eth.getTransactionCount(matcherAddress);
    const contract = new this.web3.eth.Contract(zeroExABI, contractAddress.exchangeProxy);
    const _gasLimit = await contract.methods
      .cancelLimitOrderWithHash(order.order_hash, order.maker_token, order.maker)
      .estimateGas({ from: matcherAddress });
    const gasLimit = this.web3.utils.toBN(_gasLimit);
    const gasPrice = this.web3.utils.toBN(await this.web3.eth.getGasPrice());

    const data = await contract.methods
      .cancelLimitOrderWithHash(order.order_hash, order.maker_token, order.maker)
      .encodeABI();

    const tx = new EthereumTx({
      nonce: this.web3.utils.toHex(count),
      gasLimit: this.web3.utils.toHex(gasLimit),
      gasPrice: this.web3.utils.toHex(gasPrice),
      to: contractAddress.exchangeProxy,
      data: data,
    });

    txNoStatus.status = TransactionStatus.Unsigned;
    txNoStatus.txid = `0x${tx.hash().toString('hex')}`;
    txNoStatus.signed_transaction = tx.serialize().toString('hex');

    await this.transactionService.updateTransaction(txNoStatus);
  }

  async pickCancelStellarOperations(order: OrderEntity, txNoStatus: TransactionEntity): Promise<void> {
    const stellarUrl = config.get<string>('stellar_url');
    const stellarNetworkPassphrase = config.get<string>('stellar_network_passphrase');
    const stellarExchangeAccount = config.get<string>('stellar_exchange_account');
    const stellarResponse = await CallApi(`${stellarUrl}/transactions/${order.order_hash}/operations`, {}, 'GET');
    const operations = (await stellarResponse.json())._embedded?.records || null;

    if (!operations) {
      txNoStatus.note = 'Invalid order hash';
      txNoStatus.status = TransactionStatus.Failed;
      txNoStatus.updated_at = new Date();
      await this.transactionService.updateTransaction(txNoStatus);
      return;
    }

    let orderOperation = null;
    let feeOperation = null;
    operations.forEach((detail) => {
      if (detail.type === 'manage_sell_offer' || detail.type === 'manage_buy_offer') orderOperation = detail;
      if (detail.type === 'payment') feeOperation = detail;
    });

    const buyingTargetAsset = getBuyingAssetFromOperation(orderOperation);
    const sellingTargetAsset = getSellingAssetFromOperation(orderOperation);
    const pairCoin = await this.pairService.getPairById(order.pair_id);
    let isValidOrder = true;
    let reasonFailed = '';

    if (
      (!isBaseAsset(buyingTargetAsset, pairCoin) || !isTargetAsset(sellingTargetAsset, pairCoin)) &&
      (!isBaseAsset(sellingTargetAsset, pairCoin) || !isTargetAsset(buyingTargetAsset, pairCoin))
    ) {
      this.logger.log(`Wrong target asset at order with id ${order.id}`);
      reasonFailed += 'Wrong target asset. ';
      isValidOrder = false;
    }

    if (orderOperation?.source_account !== order.maker || feeOperation?.source_account !== order.maker) {
      const message = `Wrong maker address at order with id ${order.id}, expect ${order.maker}, got ${orderOperation?.source_account}`;
      this.logger.log(message);
      reasonFailed += `${message} `;
      isValidOrder = false;
    }

    if (feeOperation?.to !== stellarExchangeAccount) {
      const message = `Wrong exchange address at order with id ${order.id}, expect ${stellarExchangeAccount}, got ${feeOperation?.to}`;
      this.logger.log(message);
      reasonFailed += `${message} `;
      isValidOrder = false;
    }

    if (!new BigNumber(feeOperation?.amount).eq(order.taker_token_fee_amounts)) {
      const message = `Wrong fee amount at order with id ${order.id}, expect ${order.taker_token_fee_amounts}, got ${feeOperation?.amount}`;
      this.logger.log(message);
      reasonFailed += `${message} `;
      isValidOrder = false;
    }

    if (!isValidOrder) {
      txNoStatus.note = reasonFailed;
      txNoStatus.status = TransactionStatus.Failed;
      txNoStatus.updated_at = new Date();
      await this.transactionService.updateTransaction(txNoStatus);
      return;
    }

    try {
      await this.stellarServer.loadAccount(order.maker);
    } catch (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        txNoStatus.note = 'The destination account does not exist!';
      } else {
        txNoStatus.note = JSON.stringify(error);
      }
      txNoStatus.status = TransactionStatus.Failed;
      txNoStatus.updated_at = new Date();
      await this.transactionService.updateTransaction(txNoStatus);
      return;
    }
    const sourceAccount = await this.stellarServer.loadAccount(this.stellarSourceKey.publicKey());
    let matchedPercent: BigNumber;
    if (new BigNumber(order.total).gt(0)) {
      matchedPercent = new BigNumber(order.filled_amount).times(order.average || 0).div(order.total);
    } else {
      matchedPercent = new BigNumber(order.filled_amount).div(order.amount);
    }
    const returnFee = new BigNumber(1)
      .minus(matchedPercent)
      .times(order.taker_token_fee_amounts)
      .toFixed(STELLAR_ACCEPT_NUMBER_OF_DECIMAL);
    const stellarAsset = new Asset(feeOperation.asset_code, feeOperation.asset_issuer);
    const feeTx = await this.stellarServer.fetchBaseFee();
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: feeTx.toString(),
      networkPassphrase: stellarNetworkPassphrase,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: order.maker,
          asset: stellarAsset,
          amount: returnFee.toString(),
        }),
      )
      .setTimeout(180)
      .build();

    txNoStatus.txid = `${tx.hash().toString('hex')}`;
    txNoStatus.signed_transaction = tx.toEnvelope().toXDR().toString('base64');
    txNoStatus.status = TransactionStatus.Unsigned;
    txNoStatus.updated_at = new Date();
    await this.transactionService.updateTransaction(txNoStatus);
  }

  @Command({
    command: 'pick-txs',
    description: 'pick txt',
  })
  async pickTxs(): Promise<void> {
    while (true) {
      const txInProcess = await this.transactionService.getOneTxInProcess(Network.BSC);
      if (txInProcess) {
        this.logger.log('Another transaction in process. Waiting for complete before next....');
        await sleep(1000);
        continue;
      }
      const txNoStatus = await this.transactionService.getOnePendingTx(Network.BSC);
      if (!txNoStatus) {
        this.logger.log('No transaction with null status. Waiting for next....');
        await sleep(1000);
        continue;
      }
      switch (txNoStatus.type) {
        case TransactionTypes.Match:
          const trade = await this.tradeService.getTradeWithId(txNoStatus.rawId);
          await this.pickTrade(trade, txNoStatus);
          break;
        case TransactionTypes.Cancel:
          const order = await this.orderService.getOrderById(txNoStatus.rawId);
          await this.pickCancelOrder(order, txNoStatus);
          break;
        default:
          throw Error('Invalid type');
      }
    }
  }

  @Command({
    command: 'pick-txs-stellar',
    description: 'pick txt stellar',
  })
  async pickTxsStellar(): Promise<void> {
    while (true) {
      const txInProcess = await this.transactionService.getOneTxInProcess(Network.Stellar);
      if (txInProcess) {
        this.logger.log('Another transaction in process. Waiting for complete before next....');
        await sleep(1000);
        continue;
      }

      const txNoStatus = await this.transactionService.getOnePendingTx(Network.Stellar);

      if (!txNoStatus) {
        this.logger.log('No transaction with null status. Waiting for next....');
        await sleep(1000);
        continue;
      }

      switch (txNoStatus.type) {
        case TransactionTypes.Cancel:
          const order = await this.orderService.getOrderById(txNoStatus.rawId);
          await this.pickCancelStellarOperations(order, txNoStatus);
          break;
        default:
          throw Error('Invalid type');
      }
    }
  }
}
