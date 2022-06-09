import { BigNumber } from '@0x/utils';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';
import { Command, Console } from 'nestjs-console';
import { RedisService } from 'nestjs-redis';
import { SOR_URL, STELLAR_HORIZON } from 'src/configs/network.config';
import { tickerConfig } from 'src/configs/ticker';
import { LAST_TICKER_DATA, TICKERS } from 'src/modules/cache/cache.constant';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { Orderbook, OrderbookRow } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { OrderbookService } from 'src/modules/orderbook/orderbook.service';
import { PairService } from 'src/modules/pairs/pair.service';
import { TickerEngine } from 'src/modules/ticker/engine/ticker-engine';
import { TickerEngineConfig } from 'src/modules/ticker/engine/ticker-engine-config';
import { KafkaInputStream } from 'src/modules/ticker/input/kafka-input-stream';
import { REDIS_CONFIG_NAME } from 'src/modules/ticker/ticker.constant';
import { Ticker, TickerData } from 'src/modules/ticker/ticker.interface';
import { get24hPoolLiquidityKey, getPoolLiquidityKey } from 'src/modules/ticker/util/helper';
import { RedisCache } from 'src/modules/ticker/util/redis-cache';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { TIME_TO_LIVE_TRADE, TIME_TO_UPDATE_CACHE } from 'src/modules/trades/trades.constant';
import { TradeService } from 'src/modules/trades/trades.service';
import { KafkaGroup, KafkaTopic } from 'src/shares/enums/kafka';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { subscribeKafka } from 'src/shares/helpers/kafka';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { convertToStellarAsset } from 'src/shares/helpers/stellar';
import { querySubGraph } from 'src/shares/helpers/subgraph';
import { sleep } from 'src/shares/helpers/utils';

@Console()
@Injectable()
export class TickerConsole {
  private tickerOrderbookUpdates: { [key: string]: { [key: string]: boolean } } = {};

  constructor(
    private readonly tradeService: TradeService,
    private readonly pairService: PairService,
    private readonly orderbookService: OrderbookService,
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext(TickerConsole.name);
  }

  @Command({
    command: 'load-ticker-data <pairId>',
    description: 'Load ticker data',
  })
  async loadTickerData(pairId: number): Promise<void> {
    this.logger.setContext(`TickerData_${pairId}`);

    const currentTime = Math.floor(new Date().getTime() / 1000);
    const fromTime = currentTime - TIME_TO_UPDATE_CACHE;

    const config = new TickerEngineConfig(InputDriver.Kafka);
    config.pairId = pairId;
    config.methods = [
      TradingMethod.StellarOrderbook,
      TradingMethod.BSCOrderbook,
      TradingMethod.CombinedOrderbook,
      TradingMethod.BSCPool,
    ];
    config.cacheManager = new RedisCache(this.cacheManager, this.redisService.getClient(REDIS_CONFIG_NAME));
    config.inputQueueName = KafkaInputStream.getTopic(pairId);
    const tickerEngine = new TickerEngine();
    await tickerEngine.initialize(config);
    const firstTrades = {};
    for (const method of config.methods) {
      firstTrades[method] = await this.tradeService.getFirstTradeBefore(fromTime, pairId, method);
    }
    const trades = await this.tradeService.getTrades(pairId, fromTime, currentTime);
    await tickerEngine.preloadData(firstTrades, fromTime, trades);

    await tickerEngine.start();
  }

  @Command({
    command: 'calculate-pools-liquidity',
    description: 'Calculate pools liquidity',
  })
  async calculatePoolsLiquidity(): Promise<void> {
    const pairs = await this.pairService.getAllPairs();
    while (true) {
      for (const pair of pairs) {
        try {
          await this.calculatePoolLiquidity(pair);
          await sleep(2000);
        } catch (e) {
          console.error(e);
        }
      }
    }
    await sleep(10000); // 10s
  }

  private async calculatePoolLiquidity(pair: PairCoin): Promise<void> {
    const baseAddress = pair.base_bsc_address;
    const quoteAddress = pair.quote_bsc_address;

    const response = await this.fetchLiquidity(baseAddress, quoteAddress);
    const json = await response.json();
    console.log(JSON.stringify(json));
    const swapsNow = json?.data?.metrics_now || [];
    const swaps24h = json?.data?.metrics_24h || [];

    const liquidity = swapsNow.length ? swapsNow[0].pairLiquidity : '0';

    this.logger.log(`Pair: ${pair.pairs_id} liquidity: ${liquidity}`);
    await this.cacheManager.set(getPoolLiquidityKey(pair.pairs_id), liquidity, { ttl: 3600 }); // 1 hour

    const liquidity24h = swaps24h.length ? swaps24h[0].pairLiquidity : '0';
    this.logger.log(`Pair: ${pair.pairs_id} liquidity 24h: ${liquidity24h}`);
    await this.cacheManager.set(get24hPoolLiquidityKey(pair.pairs_id), liquidity24h, { ttl: 3600 }); // 1 hour
  }

  private fetchLiquidity(baseAddress: string, quoteAddress: string): Promise<Response> {
    const time24hAgo = Math.floor(Date.now() / 1000) - 86400;
    const query = {
      query: `{
        metrics_now: swaps(
          first: 1,
          orderBy: timestamp, 
          orderDirection: desc,
          where: {
            tokenIn_in: ["${baseAddress}", "${quoteAddress}"]
            tokenOut_in: ["${quoteAddress}", "${baseAddress}"]
          }
        ) {
          pairLiquidity
          timestamp
        }
      
        metrics_24h: swaps(
          first: 1,
          orderBy: timestamp, 
          orderDirection: desc,
          where: {
            tokenIn_in: ["${baseAddress}", "${quoteAddress}"]
            tokenOut_in: ["${quoteAddress}", "${baseAddress}"]
            timestamp_lt: ${time24hAgo}
          }
        ) {
          pairLiquidity
          timestamp
        }
      }`,
    };

    return querySubGraph(query);
  }

  @Command({
    command: 'calculate-24h-ticker',
    description: 'Calculate 24h ticker',
  })
  async calculate24hTicker(): Promise<void> {
    const pairs = await this.pairService.getAllPairs();
    while (true) {
      for (const pair of pairs) {
        await this.calculate24hTickerForPair(pair);
      }
      await this.emit24hTicker(pairs);
      await sleep(tickerConfig.interval);
    }
  }

  private async calculate24hTickerForPair(pair: PairCoin): Promise<void> {
    await this.calculateTickerForMethod(pair, TradingMethod.StellarOrderbook);
    await this.calculateTickerForMethod(pair, TradingMethod.BSCOrderbook);
    await this.calculateTickerForMethod(pair, TradingMethod.BSCPool);
    await this.calculateTickerForMethod(pair, TradingMethod.CombinedOrderbook);
  }

  private async calculateTickerForMethod(pair: PairCoin, method: TradingMethod): Promise<void> {
    const currentTime = Math.floor(Date.now() / 1000);
    this.logger.log(`Calculating ticker for pair ${pair.pairs_id}, method: ${method} at ${currentTime}`);
    const lastTickerData = await this.getCache<TickerData>(pair.pairs_id, method, LAST_TICKER_DATA);

    const prevTickerData = await this.getCache<TickerData>(
      pair.pairs_id,
      method,
      (currentTime - TIME_TO_UPDATE_CACHE).toString(),
    );

    const liquidity = (await this.cacheManager.get<string>(getPoolLiquidityKey(pair.pairs_id))) || '0';
    const liquidity24h = (await this.cacheManager.get<string>(get24hPoolLiquidityKey(pair.pairs_id))) || '0';
    let liquidityChangePercent;
    if (new BigNumber(liquidity24h).gt('0')) {
      const liquidityChange = new BigNumber(liquidity).minus(liquidity24h || '0').toString();
      liquidityChangePercent = new BigNumber(liquidityChange).div(liquidity24h).multipliedBy('100').toFixed(2);
    }
    const orderbook = await this.getTickerOrderbook(pair.pairs_id, method);

    const ticker: Ticker = {
      method: method,
      pair_id: pair.pairs_id,
      volume: this.getVolume(lastTickerData, prevTickerData),
      quote_volume: this.getQuoteVolume(lastTickerData, prevTickerData),
      price_change: this.getPriceChange(lastTickerData, prevTickerData),
      price_change_percent: this.getChangePercent(lastTickerData, prevTickerData),
      last_price: lastTickerData?.price,
      last_price_changed: await this.getLastPriceChanged(pair, method, lastTickerData),
      last_trading_method: lastTickerData?.lastTradingMethod || TradingMethod.CombinedOrderbook,
      traded_method: this.getTradedMethod(lastTickerData, prevTickerData, method),
      liquidity,
      liquidity_change_percent: liquidityChangePercent,
      bid: orderbook.bids[0],
      ask: orderbook.asks[0],
    };

    await this.setCache(pair.pairs_id, method, '', ticker);
  }

  private getVolume(lastTickerData: TickerData, prevTickerData: TickerData): string {
    return new BigNumber(lastTickerData?.volume || 0).minus(prevTickerData?.volume || 0).toString();
  }

  private getQuoteVolume(lastTickerData: TickerData, prevTickerData: TickerData): string {
    return new BigNumber(lastTickerData?.quoteVolume || 0).minus(prevTickerData?.quoteVolume || 0).toString();
  }

  private getPriceChange(lastTickerData: TickerData, prevTickerData: TickerData): string {
    return new BigNumber(lastTickerData?.price || 0).minus(prevTickerData?.price || 0).toString();
  }

  private getChangePercent(lastTickerData: TickerData, prevTickerData: TickerData): string | undefined {
    const priceChange = this.getPriceChange(lastTickerData, prevTickerData);
    const oldPrice = prevTickerData?.price || '0';
    if (oldPrice !== '0') {
      return new BigNumber(priceChange).times(100).div(oldPrice).toFixed(2);
    }
  }

  private getTradedMethod(
    lastTickerData: TickerData,
    prevTickerData: TickerData,
    method: TradingMethod,
  ): TradingMethod {
    if (method !== TradingMethod.CombinedOrderbook) {
      return method;
    }
    const currentStellarTradeCount = lastTickerData?.tradeCounts[TradingMethod.StellarOrderbook] || 0;
    const oldStellarTradeCount = prevTickerData?.tradeCounts[TradingMethod.StellarOrderbook] || 0;
    const currentBscTradeCount = lastTickerData?.tradeCounts[TradingMethod.BSCOrderbook] || 0;
    const oldBscTradeCount = prevTickerData?.tradeCounts[TradingMethod.BSCOrderbook] || 0;
    const isTradedInStellar = currentStellarTradeCount - oldStellarTradeCount > 0;
    const isTradeInBsc = currentBscTradeCount - oldBscTradeCount > 0;
    let result = 0;
    if (isTradedInStellar) {
      result = result | TradingMethod.StellarOrderbook;
    }
    if (isTradeInBsc) {
      result = result | TradingMethod.BSCOrderbook;
    }
    return result;
  }

  private async getLastPriceChanged(
    pair: PairCoin,
    method: TradingMethod,
    lastTickerData: TickerData,
  ): Promise<string> {
    if (!lastTickerData) {
      return '0';
    }
    const lastTicker = await this.getCache<Ticker>(pair.pairs_id, method, '');
    if (!lastTicker) {
      return '0';
    }

    return new BigNumber(lastTickerData.price).minus(lastTicker.last_price).toString();
  }

  private async emit24hTicker(pairs: PairCoin[]): Promise<void> {
    const tickers = [];
    for (const pair of pairs) {
      tickers.push(await this.getCache(pair.pairs_id, TradingMethod.StellarOrderbook, ''));
      tickers.push(await this.getCache(pair.pairs_id, TradingMethod.BSCOrderbook, ''));
      tickers.push(await this.getCache(pair.pairs_id, TradingMethod.BSCPool, ''));
      tickers.push(await this.getCache(pair.pairs_id, TradingMethod.CombinedOrderbook, ''));
    }
    SocketEmitter.getInstance().emit24hTicker(tickers);
    await this.cacheManager.set(TICKERS, tickers, { ttl: TIME_TO_LIVE_TRADE });
  }

  @Command({
    command: 'update-ticker-orderbook',
    description: 'Update ticker orderbook',
  })
  async updateTickerOrderbook(): Promise<void> {
    this.logger.setContext(`TickerOrderbook`);

    const pairs = await this.pairService.getAllPairs();
    this.startUpdateOrderbook(pairs, TradingMethod.StellarOrderbook).then();
    this.startUpdateOrderbook(pairs, TradingMethod.BSCOrderbook).then();
    await this.startUpdatePoolOrderbook(pairs);
  }

  public async startUpdateOrderbook(pairs: PairCoin[], method: TradingMethod): Promise<void> {
    this.tickerOrderbookUpdates[method] = {};
    const consumer = await subscribeKafka(this.getOrderbookKafkaGroup(method), this.getOrderbookKafkaTopic(method));
    await consumer.run({
      eachMessage: async ({ message }) => {
        const pairId = message.value.toString();
        this.logger.log(`Got pair ${pairId} in method ${method}`);
        this.tickerOrderbookUpdates[method][pairId] = true;
      },
    });

    for (const pair of pairs) {
      await this.fetchTickerOrderbook(pair, method);
    }
    await this.updateOrderbookIfNeeded(pairs, method);
  }

  public async startUpdatePoolOrderbook(pairs: PairCoin[]): Promise<void> {
    while (true) {
      for (const pair of pairs) {
        await this.fetchPoolOrderbook(pair);
      }
      await sleep(60000);
    }
  }

  private async updateOrderbookIfNeeded(pairs: PairCoin[], method: TradingMethod): Promise<void> {
    while (true) {
      for (const pairId in this.tickerOrderbookUpdates[method]) {
        if (this.tickerOrderbookUpdates[method][pairId]) {
          this.tickerOrderbookUpdates[method][pairId] = false;
          await this.fetchTickerOrderbook(this.getPair(Number(pairId), pairs), method);
        }
      }
      await sleep(1000);
    }
  }

  private async fetchTickerOrderbook(pair: PairCoin, method: TradingMethod): Promise<void> {
    switch (method) {
      case TradingMethod.StellarOrderbook:
        await this.fetchStellarTickerOrderbook(pair);
        return;
      case TradingMethod.BSCOrderbook:
        await this.fetchBscTickerOrderbook(pair);
        return;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private async fetchStellarTickerOrderbook(pair: PairCoin): Promise<void> {
    this.logger.log(`Updating stellar ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
    try {
      const requestUrl = `${STELLAR_HORIZON.url}/order_book`;
      const baseType = convertToStellarAsset(pair.base_type);
      const quoteType = convertToStellarAsset(pair.quote_type);
      const params = {
        selling_asset_type: `${baseType}`,
        selling_asset_code: `${pair.base_symbol}`,
        selling_asset_issuer: `${pair.base_stellar_issuer}`,
        buying_asset_type: `${quoteType}`,
        buying_asset_code: `${pair.quote_symbol}`,
        buying_asset_issuer: `${pair.quote_stellar_issuer}`,
        limit: 1,
      };
      const response = await axios.get(requestUrl, { params });
      const stellarOrderbook = { bids: response.data.bids, asks: response.data.asks };
      stellarOrderbook.bids = stellarOrderbook.bids.map((row: OrderbookRow) => ({
        price: row.price,
        amount: new BigNumber(row.amount).div(row.price).toString(),
      }));
      stellarOrderbook.asks = stellarOrderbook.asks.map((row: OrderbookRow) => ({
        price: row.price,
        amount: row.amount,
      }));
      const orderbook = {
        bids: [stellarOrderbook.bids.length ? stellarOrderbook.bids[0] : { price: undefined, amount: undefined }],
        asks: [stellarOrderbook.asks.length ? stellarOrderbook.asks[0] : { price: undefined, amount: undefined }],
      };
      await this.saveTickerOrderbook(pair.pairs_id, TradingMethod.StellarOrderbook, orderbook);
      this.logger.log(`Updated stellar ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
    } catch (e) {
      this.logger.log(`Cannot update stellar orderbook ${pair.pairs_id}`);
      console.error(e);
    }
  }

  private async fetchBscTickerOrderbook(pair: PairCoin): Promise<void> {
    this.logger.log(`Updating bsc ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
    try {
      const bscOrderbook = await this.orderbookService.getOrderbook(pair.pairs_id);
      const orderbook = {
        bids: [bscOrderbook.bids.length ? bscOrderbook.bids[0] : { price: undefined, amount: undefined }],
        asks: [bscOrderbook.asks.length ? bscOrderbook.asks[0] : { price: undefined, amount: undefined }],
      };
      await this.saveTickerOrderbook(pair.pairs_id, TradingMethod.BSCOrderbook, orderbook);
      this.logger.log(`Updated bsc ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
    } catch (e) {
      this.logger.log(`Cannot update bsc orderbook ${pair.pairs_id}`);
      console.error(e.message);
    }
  }

  private async fetchPoolOrderbook(pair: PairCoin): Promise<void> {
    this.logger.log(`Updating pool ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
    const decimalPlaces = -Math.log10(Number(pair.price_precision));

    const amount = new BigNumber(10).pow(pair.base_decimal).times(1000).toString();
    let bidPrice = await this.fetchPrice({
      sellToken: pair.quote_bsc_address,
      buyToken: pair.base_bsc_address,
      buyAmount: amount,
    });
    let askPrice = await this.fetchPrice({
      buyToken: pair.quote_bsc_address,
      sellToken: pair.base_bsc_address,
      sellAmount: amount,
    });
    if (bidPrice) {
      bidPrice = new BigNumber(bidPrice).toFixed(decimalPlaces);
    }
    if (askPrice) {
      askPrice = new BigNumber(askPrice).toFixed(decimalPlaces);
    }
    const orderbook = {
      bids: [{ price: bidPrice, amount: bidPrice ? '1000' : undefined }],
      asks: [{ price: askPrice, amount: askPrice ? '1000' : undefined }],
    };
    await this.saveTickerOrderbook(pair.pairs_id, TradingMethod.BSCPool, orderbook);
    this.logger.log(`Updated pool ticker orderbook ${pair.base_symbol}/${pair.quote_symbol}`);
  }

  private async fetchPrice(params: {
    buyToken: string;
    sellToken: string;
    buyAmount?: string;
    sellAmount?: string;
  }): Promise<string> {
    try {
      const response = await axios.get(SOR_URL, { params: { ...params, includedSources: 'Balancer' } });
      return response.data.price;
    } catch (e) {
      this.logger.log(`Cannot fetch price: ${params.buyToken}/${params.sellToken}`);
      console.error(`Response status: ${e.response?.status}`);
    }
  }

  private async setCache(pairId: number, method: number, prefixKey: string, data: TickerData | Ticker): Promise<void> {
    await this.cacheManager.set(TickerEngine.getTickerDataKey(pairId, method, prefixKey), data, {
      ttl: TIME_TO_LIVE_TRADE,
    });
  }
  async getCache<T>(pairId: number, method: number, prefixKey: string): Promise<T> {
    return this.cacheManager.get<T>(TickerEngine.getTickerDataKey(pairId, method, prefixKey));
  }

  // eslint-disable-next-line
  private async saveTickerOrderbook(pairId: number, method: TradingMethod, data: any): Promise<void> {
    await this.cacheManager.set(this.getTickerOrderbookKey(pairId, method), data, {
      ttl: Number.MAX_SAFE_INTEGER,
    });
  }

  private async getTickerOrderbook(pairId: number, method: TradingMethod): Promise<Orderbook> {
    const emptyOrderbook = {
      bids: [{ price: undefined, amount: undefined }],
      asks: [{ price: undefined, amount: undefined }],
      updated_at: undefined,
    };
    const orderbook = await this.cacheManager.get<Orderbook>(this.getTickerOrderbookKey(pairId, method));

    switch (method) {
      case TradingMethod.StellarOrderbook:
      case TradingMethod.BSCOrderbook:
      case TradingMethod.BSCPool:
        return orderbook || emptyOrderbook;
      case TradingMethod.CombinedOrderbook:
        return this.getCombinedTickerOrderbook(pairId);
      default:
        throw new Error(`Cannot get orderbook for method ${method}`);
    }
  }

  private async getCombinedTickerOrderbook(pairId: number): Promise<Orderbook> {
    const emptyOrderbook = {
      bids: [{ price: undefined, amount: undefined }],
      asks: [{ price: undefined, amount: undefined }],
      updated_at: undefined,
    };
    const stellarOrderbookKey = this.getTickerOrderbookKey(pairId, TradingMethod.StellarOrderbook);
    const stellarOrderbook = (await this.cacheManager.get<Orderbook>(stellarOrderbookKey)) || emptyOrderbook;
    const bscOrderbookKey = this.getTickerOrderbookKey(pairId, TradingMethod.BSCOrderbook);
    const bscOrderbook = (await this.cacheManager.get<Orderbook>(bscOrderbookKey)) || emptyOrderbook;

    const bid = this.getCombinedBid(stellarOrderbook.bids[0], bscOrderbook.bids[0]);
    const ask = this.getCombinedAsk(stellarOrderbook.asks[0], bscOrderbook.asks[0]);
    return { bids: [bid], asks: [ask], updated_at: undefined };
  }

  private getCombinedBid(stellarBid, bscBid): OrderbookRow {
    if (stellarBid.price && bscBid.price) {
      const compareResult = new BigNumber(stellarBid.price).comparedTo(bscBid.price);
      if (compareResult > 0) {
        return stellarBid;
      } else if (compareResult === 0) {
        return {
          price: stellarBid.price,
          amount: new BigNumber(stellarBid.amount).plus(bscBid.amount).toString(),
        };
      } else {
        return bscBid;
      }
    } else {
      return stellarBid.price ? stellarBid : bscBid;
    }
  }

  private getCombinedAsk(stellarAsk, bscAsk): OrderbookRow {
    if (stellarAsk.price && bscAsk.price) {
      const compareResult = new BigNumber(stellarAsk.price).comparedTo(bscAsk.price);
      if (compareResult < 0) {
        return stellarAsk;
      } else if (compareResult === 0) {
        return {
          price: stellarAsk.price,
          amount: new BigNumber(stellarAsk.amount).plus(bscAsk.amount).toString(),
        };
      } else {
        return bscAsk;
      }
    } else {
      return stellarAsk.price ? stellarAsk : bscAsk;
    }
  }

  private getTickerOrderbookKey(pairId: number, method: TradingMethod): string {
    return `ticker_orderbook_${pairId}_${method}`;
  }

  private getPair(pairId: number, pairs: PairCoin[]): PairCoin {
    for (const pair of pairs) {
      if (pair.pairs_id === pairId) return pair;
    }
  }

  private getOrderbookKafkaGroup(method: TradingMethod): KafkaGroup {
    switch (method) {
      case TradingMethod.StellarOrderbook:
        return KafkaGroup.StellarTickerOrderbook;
      case TradingMethod.BSCOrderbook:
        return KafkaGroup.BscTickerOrderbook;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }

  private getOrderbookKafkaTopic(method: TradingMethod): KafkaTopic {
    switch (method) {
      case TradingMethod.StellarOrderbook:
        return KafkaTopic.StellarOrderbook;
      case TradingMethod.BSCOrderbook:
        return KafkaTopic.BscOrderbook;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
  }
}
