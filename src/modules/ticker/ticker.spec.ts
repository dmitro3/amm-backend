import {
  createInitTrades,
  createTickerData,
  createTickerTrade,
  testTickerEngine,
} from 'src/modules/ticker/util/helper';
import { TickerTrade } from 'src/modules/ticker/ticker.interface';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { TickerEngineConfig } from 'src/modules/ticker/engine/ticker-engine-config';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { MemoryCache } from 'src/modules/ticker/util/memory-cache';

describe('TickerEngine', () => {
  let cacheManager: Cache;
  const pairId = 1;
  let config: TickerEngineConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ max: 1000000 })],
    }).compile();
    cacheManager = module.get<Cache>(CACHE_MANAGER);

    config = new TickerEngineConfig(InputDriver.List);
    config.isTesting = true;
    config.pairId = pairId;
    config.methods = [TradingMethod.StellarOrderbook, TradingMethod.BSCOrderbook, TradingMethod.CombinedOrderbook];
    config.cacheManager = new MemoryCache(cacheManager);
  });

  it('test ticker 1', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const preloadTrades: TickerTrade[] = [];
    const trades: TickerTrade[] = [];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [createTickerData(initPrice, '0', '0', time)];
    const lastTickerData = createTickerData(initPrice, '0', '0', now);
    const output = { tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 2', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
    ];
    const trades: TickerTrade[] = [];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData(tradePrice, '2', '400', tradeTime),
      createTickerData(tradePrice, '2', '400', tradeTime + 1),
    ];
    const lastTickerData = createTickerData(tradePrice, '2', '400', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 3', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
      createTickerTrade(2, '150', pairId, '3', TradingMethod.StellarOrderbook, tradeTime + 5),
    ];
    const trades: TickerTrade[] = [];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData(tradePrice, '2', '400', tradeTime),
      createTickerData(tradePrice, '2', '400', tradeTime + 1),
      createTickerData('150', '5', '850', tradeTime + 6),
    ];
    const lastTickerData = createTickerData('150', '5', '850', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 4', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [];
    const trades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
      createTickerTrade(2, '150', pairId, '3', TradingMethod.StellarOrderbook, tradeTime + 5),
    ];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData(tradePrice, '2', '400', tradeTime),
      createTickerData(tradePrice, '2', '400', tradeTime + 1),
      createTickerData('150', '5', '850', tradeTime + 6),
    ];
    const lastTickerData = createTickerData('150', '5', '850', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 4', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
    ];
    const trades: TickerTrade[] = [
      createTickerTrade(2, '150', pairId, '3', TradingMethod.StellarOrderbook, tradeTime + 5),
    ];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData(tradePrice, '2', '400', tradeTime),
      createTickerData(tradePrice, '2', '400', tradeTime + 1),
      createTickerData('150', '5', '850', tradeTime + 6),
    ];
    const lastTickerData = createTickerData('150', '5', '850', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 5', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [
      createTickerTrade(2, '150', pairId, '3', TradingMethod.StellarOrderbook, tradeTime + 5),
    ];
    const trades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
    ];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData(tradePrice, '2', '400', tradeTime),
      createTickerData(tradePrice, '2', '400', tradeTime + 1),
      createTickerData('150', '5', '850', tradeTime + 6),
    ];
    const lastTickerData = createTickerData('150', '5', '850', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });

  it('test ticker 6', async () => {
    const now = Math.floor(Date.now() / 1000);
    const time = now - 12 * 60 * 60; // 12 hours ago
    const tradeTime = now - 60 * 60;

    const initPrice = '100';
    const initTrades = createInitTrades(initPrice, config.methods);
    const tradePrice = '200';
    const preloadTrades: TickerTrade[] = [];
    const trades: TickerTrade[] = [
      createTickerTrade(1, tradePrice, pairId, '2', TradingMethod.StellarOrderbook, tradeTime),
      createTickerTrade(2, '150', pairId, '3', TradingMethod.StellarOrderbook, tradeTime),
    ];
    const input = { pairId, initTrades, trades, preloadTrades };

    const tickerData = [
      createTickerData(initPrice, '0', '0', time),
      createTickerData(initPrice, '0', '0', tradeTime - 1),
      createTickerData('150', '5', '850', tradeTime),
      createTickerData('150', '5', '850', tradeTime + 1),
    ];
    const lastTickerData = createTickerData('150', '5', '850', now);
    const output = { tickerData: tickerData, lastTickerData };

    await testTickerEngine(input, output, config);
  });
});
