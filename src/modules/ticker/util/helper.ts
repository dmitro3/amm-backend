import { TickerData, TickerTrade } from 'src/modules/ticker/ticker.interface';
import { ListInputStream } from 'src/modules/ticker/input/list-input-stream';
import { TIME_TO_UPDATE_CACHE } from 'src/modules/trades/trades.constant';
import { TickerEngineConfig } from 'src/modules/ticker/engine/ticker-engine-config';
import { TickerEngine } from 'src/modules/ticker/engine/ticker-engine';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { Cache } from 'src/modules/ticker/util/cache';
import { LAST_TICKER_DATA } from 'src/modules/cache/cache.constant';

export async function testTickerEngine(
  input: {
    pairId: number;
    initTrades: { [key: string]: TickerTrade };
    trades: TickerTrade[];
    preloadTrades: TickerTrade[];
  },
  output: { tickerData: TickerData[]; lastTickerData: TickerData },
  config: TickerEngineConfig,
): Promise<void> {
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const fromTime = currentTime - TIME_TO_UPDATE_CACHE;

  config.inputStream = new ListInputStream<TickerTrade>(input.trades);

  const tickerEngine = new TickerEngine();
  await tickerEngine.initialize(config);

  await tickerEngine.preloadData(input.initTrades, fromTime, input.preloadTrades);

  await tickerEngine.start();

  await validateTickerData(
    input.pairId,
    TradingMethod.StellarOrderbook,
    output.tickerData,
    output.lastTickerData,
    config.cacheManager,
  );
}

async function validateTickerData(
  pairId: number,
  method: TradingMethod,
  tickerData: TickerData[],
  lastTicker,
  cache: Cache,
): Promise<void> {
  for (const tickerPoint of tickerData) {
    const key = TickerEngine.getTickerDataKey(pairId, method, tickerPoint.time.toString());
    expect(compareTickerData(tickerPoint, await cache.get(key))).toBe(true);
  }

  const key = TickerEngine.getTickerDataKey(pairId, method, LAST_TICKER_DATA);
  expect(compareTickerData(lastTicker, await cache.get(key), false)).toBe(true);
}

function compareTickerData(t1: TickerData, t2: TickerData, compareTime = true): boolean {
  let result = t1.price === t2.price && t1.volume === t2.volume && t1.quoteVolume === t2.quoteVolume;
  if (compareTime) {
    result = result && t1.time === t2.time;
  }
  return result;
}

export function createTickerData(
  price: string,
  volume: string,
  quoteVolume: string,
  time: number,
  method = TradingMethod.StellarOrderbook,
  tradeCounts: { [key: string]: number } = {},
): TickerData {
  return {
    price,
    volume,
    quoteVolume,
    time,
    hasNewTrades: false,
    lastTradingMethod: method,
    tradeCounts,
  };
}

export function createTickerTrade(
  id: number,
  price: string,
  pairId: number,
  amount: string,
  method: TradingMethod,
  updatedAt: number,
): TickerTrade {
  return {
    id: id,
    price,
    pair_id: pairId,
    filled_amount: amount,
    method: method,
    updated_at: new Date(updatedAt * 1000),
  };
}

export function createInitTrades(price: string, methods: TradingMethod[]): { [key: string]: TickerTrade } {
  const result = {};
  for (const method of methods) {
    result[method] = { price };
  }
  return result;
}

export function getPoolLiquidityKey(pairId: number): string {
  return `pool_liquidity_${pairId}`;
}

export function get24hPoolLiquidityKey(pairId: number): string {
  return `pool_liquidity_24h_${pairId}`;
}
