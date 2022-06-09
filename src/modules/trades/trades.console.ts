import { OrderEntity } from 'src/models/entities/order.entity';
import { OrdersService } from 'src/modules/orders/orders.service';
import { KafkaInputStream } from 'src/modules/ticker/input/kafka-input-stream';
import { TradingFeeService } from 'src/modules/tradingfee/tradingfee.service';
import { BigNumber } from '@0x/utils';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Command, Console } from 'nestjs-console';
import { kafka } from 'src/configs/kafka';
import { STELLAR_HORIZON } from 'src/configs/network.config';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { LatestBlockCoin, LatestBlockType } from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { getBaseAsset, isBaseAsset } from 'src/modules/orders/offer.helper';
import { OfferService } from 'src/modules/orders/offer.service';
import { STELLAR_SLEEP_TIME, STELLAR_LIMIT } from 'src/modules/orders/orders.const';
import { PairService } from 'src/modules/pairs/pair.service';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { TradeService } from 'src/modules/trades/trades.service';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { convertToPairMap, xor } from 'src/shares/helpers/stellar';
import { sleep } from 'src/shares/helpers/utils';
import { StellarTrade } from 'src/shares/interfaces/stellar-trade';

@Console()
@Injectable()
export class TradeConsoleService {
  private pairMap = {};

  constructor(
    private readonly tradeService: TradeService,
    private readonly latestBlockService: LatestBlockService,
    private readonly pairService: PairService,
    private readonly offerService: OfferService,
    private readonly walletService: WalletService,
    private readonly logger: Logger,
    private readonly tradingFeeService: TradingFeeService,
    private readonly orderService: OrdersService,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {
    this.logger.setContext(TradeConsoleService.name);
  }

  @Command({
    command: 'crawl-stellar-trades',
    description: 'Crawl Stellar trades',
  })
  async crawlStellarTrade(): Promise<void> {
    const producer = kafka.producer();
    await producer.connect();
    this.logger.setContext('TradeConsoleService.crawlStellarTrade');
    const latestBlock = await this.latestBlockService.getLatestBlock(LatestBlockCoin.stellar, LatestBlockType.trade);
    let cursor = latestBlock?.block || '0';
    await this.initPairs();

    while (true) {
      const response = await fetch(`${STELLAR_HORIZON.url}/trades?cursor=${cursor}&limit=${STELLAR_LIMIT}`);
      const data = await response.json();
      const trades = data._embedded?.records || [];
      this.logger.log(`Got ${trades.length} new trades`);
      for (const stellarTrade of trades) {
        this.logger.log(`Got trade ${stellarTrade.id}`);
        cursor = stellarTrade.paging_token;
        if (this.isFcxTrade(stellarTrade)) {
          this.logger.log(`Processing trade ${stellarTrade.id}`);
          await this.waitOffersIfNeeded(stellarTrade);
          let trade = await this.convertToFcxTrade(stellarTrade);
          trade = await this.tradeService.createStellarTrade(trade);
          await this.latestBlockService.saveLatestBlock(
            LatestBlockCoin.stellar,
            LatestBlockType.trade,
            stellarTrade.paging_token,
          );
          await producer.send({
            topic: KafkaInputStream.getTopic(trade.pair_id),
            messages: [{ value: JSON.stringify([trade]) }],
          });
          SocketEmitter.getInstance().emitTrades([trade], trade.pair_id);
        }
      }
      if (trades.length > 0) {
        await this.latestBlockService.saveLatestBlock(LatestBlockCoin.stellar, LatestBlockType.trade, cursor);
      }
      if (trades.length < STELLAR_LIMIT) {
        await sleep(STELLAR_SLEEP_TIME);
      }
    }
  }

  private async initPairs(): Promise<void> {
    const pairs = await this.pairService.getAllPairs();
    this.pairMap = convertToPairMap(pairs);
  }

  @Command({
    command: 'crawl-stellar-trade-offers',
    description: "Crawl Stellar Trade's Offers",
  })
  async updateStellarOffers(): Promise<void> {
    const producer = kafka.producer();
    await producer.connect();
    this.logger.setContext('TradeConsoleService.updateStellarOffers');
    const latestBlock = await this.latestBlockService.getLatestBlock(
      LatestBlockCoin.stellar,
      LatestBlockType.tradeOffer,
    );
    let cursor = latestBlock?.block || '0';
    await this.initPairs();

    while (true) {
      const response = await fetch(`${STELLAR_HORIZON.url}/trades?cursor=${cursor}&limit=${STELLAR_LIMIT}`);
      const data = await response.json();
      const trades = data._embedded?.records || [];
      this.logger.log(`Got ${trades.length} new trades`);
      for (const stellarTrade of trades) {
        this.logger.log(`Got trade ${stellarTrade.id}`);
        cursor = stellarTrade.paging_token;
        if (this.isFcxTrade(stellarTrade)) {
          this.logger.log(`Processing trade ${stellarTrade.id}`);
          await this.waitOffersIfNeeded(stellarTrade);
          await this.offerService.createOrUpdateStellarOffers(stellarTrade, this.findPair(stellarTrade));
        }
      }
      if (trades.length > 0) {
        await this.latestBlockService.saveLatestBlock(LatestBlockCoin.stellar, LatestBlockType.tradeOffer, cursor);
      }
      if (trades.length < STELLAR_LIMIT) {
        await sleep(STELLAR_SLEEP_TIME);
      }
    }
  }

  private async waitOffersIfNeeded(stellarTrade: StellarTrade): Promise<void> {
    for (let i = 0; i < 5; i++) {
      if (await this.offerService.isStellarOffersExisted(stellarTrade)) {
        break;
      } else {
        this.logger.log(`Offer doesn't exist, sleeping 1000 ms`);
        await sleep(1000); // wait for client submit order to backend
      }
    }
  }

  private findPair(stellarTrade: StellarTrade): PairCoin {
    const pairKey = this.getPairKey(stellarTrade);
    return this.pairMap[pairKey];
  }

  private findPairId(stellarTrade: StellarTrade): number {
    const pairKey = this.getPairKey(stellarTrade);
    const pair = this.pairMap[pairKey];
    return pair ? pair.pairs_id : -1;
  }

  private getPairKey(stellarTrade: StellarTrade): string {
    const {
      base_asset_type,
      base_asset_code = '',
      base_asset_issuer = '',
      counter_asset_type,
      counter_asset_code = '',
      counter_asset_issuer = '',
    } = stellarTrade;
    const baseKey = `${base_asset_type}_${base_asset_code}_${base_asset_issuer}`;
    const counterKey = `${counter_asset_type}_${counter_asset_code}_${counter_asset_issuer}`;
    return `${baseKey}_${counterKey}`;
  }

  private isFcxTrade(stellarTrade: StellarTrade): boolean {
    return this.findPairId(stellarTrade) >= 0;
  }

  private async convertToFcxTrade(stellarTrade: StellarTrade): Promise<TradeEntity> {
    const pair = this.findPair(stellarTrade);
    const isSameAssetOrder = isBaseAsset(getBaseAsset(stellarTrade), pair);
    const { d, n } = stellarTrade.price;
    const price = isSameAssetOrder ? new BigNumber(n).div(d).toString() : new BigNumber(d).div(n).toString();
    const amount = isSameAssetOrder ? stellarTrade.base_amount : stellarTrade.counter_amount;
    const baseAccountId = (await this.walletService.getUserIdByWalletAccount(stellarTrade.base_account)) || -1;
    const counterAccountId = (await this.walletService.getUserIdByWalletAccount(stellarTrade.counter_account)) || -1;
    const pairId = this.findPairId(stellarTrade);
    const baseOffer = await this.orderService.getOrderByStellarId(stellarTrade.base_offer_id);
    const counterOffer = await this.orderService.getOrderByStellarId(stellarTrade.counter_offer_id);
    const baseOfferId = baseOffer?.id || -1;
    const counterOfferId = counterOffer?.id || -1;
    const baseAmountFee = this.calculateFeeAmount(amount, price, baseOffer);
    const counterAmountFee = this.calculateFeeAmount(amount, price, counterOffer);

    const trade = new TradeEntity();
    trade.pair_id = pairId;
    trade.buy_user_id = isSameAssetOrder ? counterAccountId : baseAccountId;
    trade.sell_user_id = isSameAssetOrder ? baseAccountId : counterAccountId;
    trade.price = price;
    trade.filled_amount = amount;
    trade.sell_fee = isSameAssetOrder ? baseAmountFee : counterAmountFee;
    trade.buy_fee = isSameAssetOrder ? counterAmountFee : baseAmountFee;
    trade.buy_address = isSameAssetOrder ? stellarTrade.counter_account : stellarTrade.base_account;
    trade.sell_address = isSameAssetOrder ? stellarTrade.base_account : stellarTrade.counter_account;
    trade.buyer_is_taker = !xor([isSameAssetOrder, stellarTrade.base_is_seller]);
    trade.method = TradingMethod.StellarOrderbook;
    trade.stellar_id = stellarTrade.id;
    trade.pool_id = undefined;
    trade.txid = await this.fetchTxid(stellarTrade);
    trade.created_at = new Date(stellarTrade.ledger_close_time);
    trade.updated_at = new Date(stellarTrade.ledger_close_time);

    if (isSameAssetOrder) {
      trade.buy_order_id = counterOfferId;
      trade.sell_order_id = baseOfferId;
    } else {
      trade.buy_order_id = baseOfferId;
      trade.sell_order_id = counterOfferId;
    }
    return trade;
  }

  private async fetchTxid(stellarTrade: StellarTrade): Promise<string> {
    const operationUrl = stellarTrade._links?.operation?.href;
    if (operationUrl) {
      try {
        const operationId = operationUrl.substring(operationUrl.lastIndexOf('/') + 1);
        const response = await fetch(`${STELLAR_HORIZON.url}/operations/${operationId}`);
        const data = await response.json();
        return data?.transaction_hash;
      } catch (e) {
        this.logger.log(`Cannot get txid of operation ${operationUrl}`);
      }
    }
  }

  private calculateFeeAmount(amount: string, price: string, order: OrderEntity): string {
    if (!order) {
      return '0';
    }
    const amountIncludedFee = order.getAmountIncludedFee(amount);
    let matchedValue;
    let orderValue;
    if (order.isUsingTotal()) {
      matchedValue = new BigNumber(amountIncludedFee).times(price).toString();
      orderValue = order.total;
    } else {
      matchedValue = new BigNumber(amountIncludedFee).toString();
      orderValue = order.amount;
    }
    return new BigNumber(matchedValue).div(orderValue).times(order.taker_token_fee_amounts).toString();
  }
}
