import { BigNumber } from '@0x/utils';
import { Logger } from '@nestjs/common';
import { LAST_TICKER_DATA } from 'src/modules/cache/cache.constant';
import { AsyncBlockingQueue } from 'src/modules/matching-engine/util/async-blocking-queue';
import { TickerEngineConfig } from 'src/modules/ticker/engine/ticker-engine-config';
import { TickerEngineAction } from 'src/modules/ticker/enum/ticker-engine-action';
import { InputStreamFactory } from 'src/modules/ticker/input/input-stream-factory';
import { Ticker, TickerData, TickerTrade } from 'src/modules/ticker/ticker.interface';
import { Cache } from 'src/modules/ticker/util/cache';
import { TIME_TO_LIVE_TRADE } from 'src/modules/trades/trades.constant';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { sleep } from 'src/shares/helpers/utils';

export class TickerEngine {
  private cacheManager: Cache;

  protected unprocessedTrades = new AsyncBlockingQueue<TickerTrade>();
  // TODO clear this map somehow
  protected receivedTrades: { [key: number]: number } = {};
  protected tickerOutputs = new AsyncBlockingQueue<Ticker>();

  protected config: TickerEngineConfig;
  protected logger: Logger;

  public async initialize(config: TickerEngineConfig): Promise<void> {
    this.config = config;
    this.cacheManager = config.cacheManager;
    this.logger = new Logger(`${TickerEngine.name}_${config.pairId}`);

    if (!config.methods.length) {
      throw new Error('Methods cannot be empty.');
    }

    this.startInputThread(config);
  }

  protected startInputThread(config: TickerEngineConfig): void {
    const inputStream = InputStreamFactory.createInputStream(config);
    inputStream.setOnNewDataCallback((trade: TickerTrade) => {
      this.onNewTrade(trade);
    });
    inputStream.connect();
  }

  public onNewTrade(trade: TickerTrade): void {
    this.logger.log(`Add trade: ${JSON.stringify(trade)}`);

    if (this.receivedTrades[trade.id]) {
      this.logger.log('Trade is already processed');
      return;
    }
    this.receivedTrades[trade.id] = trade.id;
    this.unprocessedTrades.enqueue(trade);
  }

  public async start(): Promise<void> {
    if (this.config.isTesting) {
      await sleep(10);
    }
    this.addEmptyTrades(this.config.pairId).then();
    while (true) {
      const action = await this.onTick();
      if (TickerEngineAction.Stop === action) {
        await sleep(10);
        break;
      }
    }
  }

  protected async onTick(): Promise<TickerEngineAction> {
    if (this.unprocessedTrades.isEmpty() && this.config.isTesting) {
      return TickerEngineAction.Stop;
    }
    const trade = await this.unprocessedTrades.dequeue();
    for (const method of this.config.methods) {
      if ((trade.method & method) > 0) {
        await this.updateTickerData(trade, method);
      }
    }
    return TickerEngineAction.Continue;
  }

  public async preloadData(
    firstTrades: { [key: string]: TickerTrade },
    startTime: number,
    trades: TickerTrade[],
  ): Promise<void> {
    const pairId = this.config.pairId;
    this.logger.log(`Start loading ticker data of pair ${pairId}`);
    for (const method of this.config.methods) {
      const firstTickerData: TickerData = {
        volume: '0',
        quoteVolume: '0',
        price: firstTrades[method]?.price || '0',
        time: startTime - 1,
        hasNewTrades: false,
        lastTradingMethod: method,
        tradeCounts: {},
      };
      await this.setCache(pairId, LAST_TICKER_DATA, method, firstTickerData);
    }
    for (const trade of trades) {
      for (const method of this.config.methods) {
        if ((trade.method & method) > 0) {
          await this.updateTickerData(trade, method);
        }
      }
    }
    this.logger.log(`Finish loading ticker data of pair ${pairId}`);
  }

  async updateTickerData(trade: TickerTrade, method: TradingMethod): Promise<void> {
    this.logger.log(`Start processing method: ${method}, trade: ${JSON.stringify(trade)}`);

    const tradeTime = this.getTime(trade.updated_at);
    let lastTickerData: TickerData = await this.getCache(trade.pair_id, LAST_TICKER_DATA, method);
    if (tradeTime === lastTickerData.time) {
      this.logger.log(`Updating ticker data at ${tradeTime}`);
      if (trade.id >= 0) {
        lastTickerData = this.updateLastTickerData(lastTickerData, trade);
        await this.setCache(trade.pair_id, LAST_TICKER_DATA, method, lastTickerData);
        await this.setCache(trade.pair_id, tradeTime.toString(), method, lastTickerData);
      }
    } else if (tradeTime > lastTickerData.time) {
      await this.addMissingTickerData(method, lastTickerData, trade, tradeTime);
      const tickerData: TickerData = {
        volume: new BigNumber(trade.filled_amount).plus(lastTickerData.volume).toString(),
        quoteVolume: new BigNumber(trade.price).times(trade.filled_amount).plus(lastTickerData.quoteVolume).toString(),
        price: trade.id < 0 ? lastTickerData.price : trade.price,
        time: tradeTime,
        hasNewTrades: trade.id >= 0,
        lastTradingMethod: trade.id < 0 ? lastTickerData.lastTradingMethod : trade.method,
        tradeCounts: this.getNewTradeCounts(lastTickerData, trade),
      };
      await this.setCache(trade.pair_id, LAST_TICKER_DATA, method, tickerData);
      await this.setCache(trade.pair_id, tradeTime.toString(), method, tickerData);
    } else {
      await this.updateOldTickerData(trade, method);
    }
    this.logger.log(`End processing method: ${method}, trade: ${trade.id}`);
  }

  private updateLastTickerData(lastTickerData: TickerData, trade: TickerTrade): TickerData {
    lastTickerData.volume = new BigNumber(trade.filled_amount).plus(lastTickerData.volume).toString();
    lastTickerData.quoteVolume = new BigNumber(trade.price)
      .times(trade.filled_amount)
      .plus(lastTickerData.quoteVolume)
      .toString();
    lastTickerData.price = trade.price;
    lastTickerData.hasNewTrades = true;
    lastTickerData.lastTradingMethod = trade.method;
    lastTickerData.tradeCounts = this.getNewTradeCounts(lastTickerData, trade);
    return lastTickerData;
  }

  private getNewTradeCounts(tickerData: TickerData, trade: TickerTrade): { [key: string]: number } {
    const tradeCounts = { ...tickerData.tradeCounts };
    if (trade.id < 0) {
      return tradeCounts;
    }
    if (!tradeCounts[trade.method]) {
      tradeCounts[trade.method] = 1;
    } else {
      tradeCounts[trade.method] = tradeCounts[trade.method] + 1;
    }
    return tradeCounts;
  }

  private async addMissingTickerData(
    method: TradingMethod,
    lastTickerData: TickerData,
    trade: TickerTrade,
    time: number,
  ): Promise<void> {
    this.logger.log(
      `Adding ticker data from ${lastTickerData.time} to ${time}, adding ${time - lastTickerData.time} records`,
    );
    const data = [];
    for (let i = lastTickerData.time + 1; i < time; i++) {
      const tickerData = { ...lastTickerData, time: i, hasNewTrades: false };
      data.push({
        key: TickerEngine.getTickerDataKey(trade.pair_id, method, i.toString()),
        value: tickerData,
        ttl: TIME_TO_LIVE_TRADE,
      });
    }
    await this.cacheManager.mSet(data);
  }

  private async updateOldTickerData(trade: TickerTrade, method: TradingMethod): Promise<void> {
    this.logger.log(`Update old ticker data`);
    if (trade.id < 0) {
      return;
    }
    const tradeTime = this.getTime(trade.updated_at);
    let time = tradeTime;
    let tickerData: TickerData;
    let hasNewTrades = false;
    while (true) {
      const oldTickerData: TickerData = await this.getCache(trade.pair_id, time.toString(), method);
      if (!oldTickerData) {
        if (!tickerData) {
          this.logger.log(`This trade is too old, cannot find ticker data`);
          break;
        }
        await this.setCache(trade.pair_id, LAST_TICKER_DATA, method, tickerData);
        break;
      }
      if (time !== tradeTime && oldTickerData.hasNewTrades) {
        hasNewTrades = true;
      }
      tickerData = {
        volume: new BigNumber(trade.filled_amount).plus(oldTickerData.volume).toString(),
        quoteVolume: new BigNumber(trade.price).times(trade.filled_amount).plus(oldTickerData.quoteVolume).toString(),
        price: hasNewTrades ? oldTickerData.price : trade.price,
        time: time,
        hasNewTrades: oldTickerData.hasNewTrades || time === tradeTime,
        lastTradingMethod: hasNewTrades ? oldTickerData.lastTradingMethod : trade.method,
        tradeCounts: this.getNewTradeCounts(oldTickerData, trade),
      };
      this.logger.log(`Update old ticker data at ${time}, method: ${method}`);
      await this.setCache(trade.pair_id, time.toString(), method, tickerData);
      time++;
    }
  }

  private async addEmptyTrades(pairId: number): Promise<void> {
    while (true) {
      for (const method of this.config.methods) {
        this.unprocessedTrades.enqueue(this.createEmptyTrade(pairId, method));
      }
      if (this.config.isTesting) break;
      await sleep(60000);
    }
  }

  private createEmptyTrade(pairId: number, method: number): TickerTrade {
    return {
      id: -1,
      pair_id: pairId,
      price: '0',
      filled_amount: '0',
      method: method,
      updated_at: new Date(),
    };
  }

  private async setCache(pairId: number, prefixKey: string, method: number, data: TickerData | Ticker): Promise<void> {
    await this.cacheManager.set(TickerEngine.getTickerDataKey(pairId, method, prefixKey), data, TIME_TO_LIVE_TRADE);
  }
  async getCache<T>(pairId: number, prefixKey: string, method: number): Promise<T> {
    return this.cacheManager.get<T>(TickerEngine.getTickerDataKey(pairId, method, prefixKey));
  }

  public static getTickerDataKey(pairId: number, method: number, key: string): string {
    return `ticker_data_${pairId}_${method}_${key}`;
  }

  private getTime(date: string | Date): number {
    return Math.floor((typeof date === 'string' ? new Date(date) : date).getTime() / 1000);
  }
}
