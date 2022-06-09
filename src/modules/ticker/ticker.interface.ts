import { OrderbookRow } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { TradingMethod } from 'src/shares/enums/trading-method';

export interface Ticker {
  method: TradingMethod;
  pair_id: number;
  volume: string;
  quote_volume: string;
  price_change: string;
  price_change_percent: string;
  last_price: string;
  last_price_changed: string;
  last_trading_method: TradingMethod;
  traded_method: TradingMethod;
  liquidity?: string;
  liquidity_change_percent?: string;
  bid: OrderbookRow;
  ask: OrderbookRow;
}

export interface TickerTrade {
  id: number;
  price: string;
  pair_id: number;
  filled_amount: string;
  method: number;
  updated_at: Date | string;
}

export interface TickerData {
  volume: string;
  quoteVolume: string;
  price: string;
  time: number;
  hasNewTrades: boolean;
  lastTradingMethod: TradingMethod;
  tradeCounts: { [key: string]: number };
}
