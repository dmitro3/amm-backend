import { Cache } from 'cache-manager';
import { OrderEntity } from 'src/models/entities/order.entity';
import { Trade } from 'src/modules/matching-engine/entity/trade';
import { BigNumber } from '@0x/utils';
import { OrderSide } from 'src/modules/orders/orders.const';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';
import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OrderOutputAction } from 'src/modules/matching-engine/enum/order-output-action';
import { Comparable } from 'src/modules/matching-engine/entity/comparable';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { MatchingEngineConfig } from 'src/modules/matching-engine/engine/matching-engine-config';
import { InputDriver } from 'src/modules/matching-engine/enum/input-driver';
import { OutputDriver } from 'src/modules/matching-engine/enum/output-driver';
import { ListInputStream } from 'src/modules/matching-engine/input/list-input-stream';
import { ListOutputStream } from 'src/modules/matching-engine/output/list-output-stream';
import { MatchingEngine } from 'src/modules/matching-engine/engine/matching-engine';
import {
  Orderbook,
  OrderbookRow,
  RedisOrderbookStream,
} from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { BaseEmitter } from 'src/shares/helpers/base-emitter';

export const DEFAULT_FEE_RATE = '0.0015';

export const EPSILON = '0.0000001';
export const STELLAR_EPSILON = '0.000005';
export const MATCHING_ENGINE_PRECISION = 15;

function getAmountWithoutFee(amount: string, feeRate: string): string {
  return new BigNumber('1').minus(feeRate).times(amount).toString();
}

export function createOrder(
  id: number,
  side: number,
  type: number,
  price: string,
  amount: string,
  total: string = undefined,
  feeRate = DEFAULT_FEE_RATE,
): OrderEntity {
  const order = new OrderEntity();
  order.id = id;
  order.side = side;
  order.type = type;
  order.price = price;
  order.amount = amount;
  order.filled_amount = '0';
  order.remaining_amount = new BigNumber(1).minus(feeRate).times(amount).toString();
  order.total = total;
  order.fee_rate = feeRate;
  order.expiry = Number.MAX_SAFE_INTEGER;
  order.updated_at = new Date(Date.now());
  return order;
}

export function createTrade(
  buyId: number,
  sellId: number,
  price: string,
  quantity: string,
  buyerIsTaker: boolean,
  feeRate = DEFAULT_FEE_RATE,
): Trade {
  const buyOrder = new OrderEntity();
  buyOrder.id = buyId;
  const sellOrder = new OrderEntity();
  sellOrder.id = sellId;
  return new Trade(
    buyOrder,
    sellOrder,
    new BigNumber(price),
    new BigNumber(getAmountWithoutFee(quantity, feeRate)),
    buyerIsTaker,
  );
}
export function createOrderInput(
  action: OrderInputAction,
  id: number,
  side: number,
  type: number,
  price: string,
  amount: string,
): OrderInput {
  const order = createOrder(id, side, type, price, amount);
  return new OrderInput(action, order);
}

export function createOrderbookOutput(
  side: OrderSide,
  price: string,
  quantity: string,
  feeRate = DEFAULT_FEE_RATE,
): OrderbookOutput {
  return new OrderbookOutput(side, price, getAmountWithoutFee(quantity, feeRate));
}
export function createOrderOutputTrade(
  buyId: number,
  sellId: number,
  price: string,
  quantity: string,
  buyerIsTaker: boolean,
  feeRate = DEFAULT_FEE_RATE,
): OrderOutput {
  const trade: Trade = this.createTrade(buyId, sellId, price, quantity, buyerIsTaker, feeRate);
  return new OrderOutput(OrderOutputAction.Match, [trade], undefined);
}
export function createOrderOutputTrades(trades: Trade[]): OrderOutput {
  return new OrderOutput(OrderOutputAction.Match, trades, undefined);
}

export function createOrderOutputCanceled(order: OrderEntity): OrderOutput {
  return new OrderOutput(OrderOutputAction.Cancel, [], order);
}

export function validateOutputs<T extends Comparable>(expects: T[], results: T[]): void {
  expect(results.length).toBe(expects.length);

  const size = expects.length;
  for (let i = 0; i < size; i++) {
    expect(expects[i].equals(results[i])).toBe(true);
  }
}

export async function testMatching(
  orders: OrderEntity[],
  orderOutputs: OrderOutput[],
  orderbookOutputs: OrderbookOutput[],
  sleepTime = 10,
): Promise<void> {
  const orderInputs: OrderInput[] = orders.map((order) => {
    return new OrderInput(OrderInputAction.Create, order);
  });
  await testEngine(orderInputs, orderOutputs, orderbookOutputs, sleepTime);
}

export async function testEngine(
  orderInputs: OrderInput[],
  orderOutputs: OrderOutput[],
  orderbookOutputs: OrderbookOutput[],
  sleepTime = 10,
): Promise<void> {
  const config: MatchingEngineConfig = new MatchingEngineConfig(InputDriver.List, OutputDriver.List, OutputDriver.List);
  config.isTesting = true;
  config.sleepTime = sleepTime;
  config.orderInputDriver = InputDriver.List;
  config.orderInputStream = new ListInputStream(orderInputs);
  config.orderOutputDriver = OutputDriver.List;
  const orderOutputStream: ListOutputStream<OrderOutput> = new ListOutputStream();
  config.orderOutputStream = orderOutputStream;
  config.orderbookOutputDriver = OutputDriver.List;
  const orderbookOutputStream: ListOutputStream<OrderbookOutput> = new ListOutputStream();
  config.orderbookOutputStream = orderbookOutputStream;

  const matchingEngine: MatchingEngine = new MatchingEngine();
  await matchingEngine.initialize(config);

  await matchingEngine.start();
  // this.logQueue("Order output:", matchingEngine.getOrderOutputs());
  // this.logQueue("Buy orders:", matchingEngine.getBuyOrders());
  // this.logQueue("Sell orders: ", matchingEngine.getSellOrders());

  validateOutputs(orderOutputs, orderOutputStream.getData());
  validateOutputs(orderbookOutputs, orderbookOutputStream.getData());

  // Check memory leak
  const orderCount = matchingEngine.getBuyOrders().size + matchingEngine.getSellOrders().size;
  const priorityNumberCount = matchingEngine.getOrdersPriority().size;
  const expiryQueueLength = matchingEngine.getOrderExpiryQueue().size;
  expect(orderCount).toBe(priorityNumberCount);
  expect(orderCount).toBe(expiryQueueLength);
}

export async function testOrderbook(
  cacheManager: Cache,
  orderbookOutputs: OrderbookOutput[],
  expect: Orderbook,
): Promise<void> {
  const redisOrderbookStream = new RedisOrderbookStream(0, cacheManager, BaseEmitter.getInstance());
  for (const row of orderbookOutputs) {
    await redisOrderbookStream.publish(row);
  }
  validateOrderbook(expect, redisOrderbookStream.buildOrderbook());
}

export function validateOrderbook(expects: Orderbook, results: Orderbook): void {
  expect(results.bids.length).toBe(expects.bids.length);
  expect(results.asks.length).toBe(expects.asks.length);
  compareOrderbookRows(expects.bids, results.bids);
  compareOrderbookRows(expects.asks, results.asks);
}

function compareOrderbookRows(expectRows: OrderbookRow[], resultRows: OrderbookRow[]): void {
  const rowCount = expectRows.length;
  for (let i = 0; i < rowCount; i++) {
    compareOrderbookRow(expectRows[i], resultRows[i]);
  }
}

function compareOrderbookRow(expectRow: OrderbookRow, resultRow: OrderbookRow): void {
  expect(resultRow.price).toBe(expectRow.price);
  expect(resultRow.amount).toBe(expectRow.amount);
}

export function getOrderbookAmount(amount: string, feeRate = DEFAULT_FEE_RATE): string {
  return getAmountWithoutFee(amount, feeRate);
}

export function isEqual(n1: string | BigNumber, n2: string | BigNumber, epsilon = EPSILON): boolean {
  return new BigNumber(n1).minus(n2).abs().lt(epsilon);
}
