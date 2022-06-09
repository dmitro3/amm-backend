import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';
import { OrderSide, OrderType } from 'src/modules/orders/orders.const';
import {
  createOrder,
  createOrderbookOutput,
  createOrderInput,
  createOrderOutputCanceled,
  createOrderOutputTrade,
  createOrderOutputTrades,
  createTrade,
  testEngine,
  testMatching,
} from 'src/modules/matching-engine/util/helper';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { sleep } from 'src/shares/helpers/utils';

describe('MatchingEngine', () => {
  beforeEach(async () => {});

  it('matching limit 1', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 2', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '9000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 3', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '2'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '9000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '2'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 4', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '2'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '9000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 5', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '3'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(3, OrderSide.Sell, OrderType.Limit, '9000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrade(1, 2, '9000', '1', false),
      createOrderOutputTrade(1, 3, '9000', '1', false),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '3'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 6', async () => {
    const orders = [
      createOrder(1, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(3, OrderSide.Buy, OrderType.Limit, '9000', '3'),
    ];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([createTrade(3, 1, '9000', '1', true), createTrade(3, 2, '9000', '1', true)]),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 7', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Buy, OrderType.Limit, '10000', '1'),
      createOrder(3, OrderSide.Sell, OrderType.Limit, '9000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(2, 3, '10000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching limit 8', async () => {
    const orders = [
      createOrder(1, OrderSide.Sell, OrderType.Limit, '10000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(3, OrderSide.Buy, OrderType.Limit, '10000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(3, 2, '9000', '1', true)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 1', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Market, '8000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '9000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 2', async () => {
    const orders = [
      createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1'),
      createOrder(1, OrderSide.Buy, OrderType.Market, '11000', '1'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '10000', '1', true)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 3', async () => {
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Market, '9000', '1');
    const orders = [order1, createOrder(2, OrderSide.Sell, OrderType.Limit, '9000', '1')];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1)];
    const orderbookOutputs: OrderbookOutput[] = [createOrderbookOutput(OrderSide.Sell, '9000', '1')];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 4', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Buy, OrderType.Limit, '10000', '2'),
      createOrder(3, OrderSide.Sell, OrderType.Market, '8000', '3'),
    ];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([createTrade(2, 3, '10000', '2', false), createTrade(1, 3, '9000', '1', false)]),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '2'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-2'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 5', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Buy, OrderType.Limit, '10000', '2'),
      createOrder(3, OrderSide.Buy, OrderType.Limit, '8000', '3'),
      createOrder(4, OrderSide.Sell, OrderType.Market, '7000', '4'),
    ];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([
        createTrade(2, 4, '10000', '2', false),
        createTrade(1, 4, '9000', '1', false),
        createTrade(3, 4, '8000', '1', false),
      ]),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '2'),
      createOrderbookOutput(OrderSide.Buy, '8000', '3'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-2'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 6', async () => {
    const order4 = createOrder(4, OrderSide.Buy, OrderType.Market, '11000', '7');
    const orders = [
      createOrder(1, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '2'),
      createOrder(3, OrderSide.Sell, OrderType.Limit, '8000', '3'),
      order4,
    ];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([
        createTrade(4, 3, '8000', '3', true),
        createTrade(4, 1, '9000', '1', true),
        createTrade(4, 2, '10000', '2', true),
      ]),
      createOrderOutputCanceled(order4),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '2'),
      createOrderbookOutput(OrderSide.Sell, '8000', '3'),
      createOrderbookOutput(OrderSide.Sell, '8000', '-3'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '-2'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 7', async () => {
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Market, '10000', '1');
    const orders = [createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'), order2];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order2)];
    const orderbookOutputs: OrderbookOutput[] = [createOrderbookOutput(OrderSide.Buy, '9000', '1')];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 8', async () => {
    const order2 = createOrder(2, OrderSide.Buy, OrderType.Market, '8000', '1');
    const orders = [createOrder(1, OrderSide.Sell, OrderType.Limit, '9000', '1'), order2];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order2)];
    const orderbookOutputs: OrderbookOutput[] = [createOrderbookOutput(OrderSide.Sell, '9000', '1')];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 9', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Market, '8000', undefined, '9000'),
    ];
    const orderOutputs: OrderOutput[] = [createOrderOutputTrade(1, 2, '9000', '1', false)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 10', async () => {
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Market, '8000', undefined, '10000');
    const orders = [createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'), order2];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrade(1, 2, '9000', '1', false),
      createOrderOutputCanceled(order2),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 11', async () => {
    const orders = [
      createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Buy, OrderType.Limit, '10000', '1'),
      createOrder(3, OrderSide.Sell, OrderType.Market, '8000', undefined, '15000'),
    ];
    const quantity2 = (15000 - 10000 * 1) / 9000;
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([
        createTrade(2, 3, '10000', '1', false),
        createTrade(1, 3, '9000', quantity2.toString(), false),
      ]),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', (-quantity2).toString()),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 12', async () => {
    const order2 = createOrder(2, OrderSide.Buy, OrderType.Market, '10000', undefined, '15000');
    const orders = [createOrder(1, OrderSide.Sell, OrderType.Limit, '9000', '1'), order2];
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrade(2, 1, '9000', '1', true),
      createOrderOutputCanceled(order2),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('matching market 14', async () => {
    const orders = [
      createOrder(1, OrderSide.Sell, OrderType.Limit, '9000', '1'),
      createOrder(2, OrderSide.Sell, OrderType.Limit, '9500', '1'),
      createOrder(3, OrderSide.Buy, OrderType.Market, '11000', undefined, '15000'),
    ];
    const quantity2 = (15000 - 9000 * 1) / 9500;
    const orderOutputs: OrderOutput[] = [
      createOrderOutputTrades([
        createTrade(3, 1, '9000', '1', true),
        createTrade(3, 2, '9500', quantity2.toString(), true),
      ]),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9500', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9500', (-quantity2).toString()),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('cancel 1', async () => {
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    const orderInputs: OrderInput[] = [
      new OrderInput(OrderInputAction.Create, order1),
      new OrderInput(OrderInputAction.Cancel, order1),
      createOrderInput(OrderInputAction.Create, 2, OrderSide.Sell, OrderType.Limit, '9000', '1'),
    ];

    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
    ];
    await testEngine(orderInputs, orderOutputs, orderbookOutputs);
  });

  it('cancel 2', async () => {
    const order2 = createOrder(2, OrderSide.Buy, OrderType.Limit, '9000', '1');
    const order4 = createOrder(4, OrderSide.Sell, OrderType.Market, '6000', '5');
    const orderInputs: OrderInput[] = [
      createOrderInput(OrderInputAction.Create, 1, OrderSide.Buy, OrderType.Limit, '8000', '1'),
      new OrderInput(OrderInputAction.Create, order2),
      new OrderInput(OrderInputAction.Cancel, order2),
      createOrderInput(OrderInputAction.Create, 3, OrderSide.Buy, OrderType.Limit, '10000', '1'),
      new OrderInput(OrderInputAction.Create, order4),
    ];

    const orderOutputs: OrderOutput[] = [
      createOrderOutputCanceled(order2),
      createOrderOutputTrades([createTrade(3, 4, '10000', '1', false), createTrade(1, 4, '8000', '1', false)]),
      createOrderOutputCanceled(order4),
    ];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '-1'),
    ];
    await testEngine(orderInputs, orderOutputs, orderbookOutputs);
  });

  it('cancel 3', async () => {
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    const orderInputs: OrderInput[] = [new OrderInput(OrderInputAction.Cancel, order1)];

    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1)];
    const orderbookOutputs: OrderbookOutput[] = [];
    await testEngine(orderInputs, orderOutputs, orderbookOutputs);
  });

  it('time in force 1', async () => {
    jest.setTimeout(10000);
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = Date.now() / 1000 - 1; // order expired
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1');
    order2.expiry = Date.now() / 1000 - 1; // order expired
    const orders = [order1, order2];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1), createOrderOutputCanceled(order2)];
    const orderbookOutputs: OrderbookOutput[] = [];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('time in force 2', async () => {
    jest.setTimeout(10000);
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = Date.now() / 1000 + 4; // expiry in 4 seconds
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1');
    order2.expiry = Date.now() / 1000 + 4; // expiry in 4 seconds
    const orders = [order1, order2];
    const orderOutputs: OrderOutput[] = [];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('time in force 3', async () => {
    jest.setTimeout(10000);
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = Date.now() / 1000 + 2; // expiry in 2 seconds
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1');
    order2.expiry = Date.now() / 1000 + 2; // expiry in 2 seconds
    const orders = [order1, order2];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1), createOrderOutputCanceled(order2)];
    const orderbookOutputs: OrderbookOutput[] = [];
    await sleep(3000);
    await testMatching(orders, orderOutputs, orderbookOutputs);
  });

  it('time in force 4', async () => {
    jest.setTimeout(10000);
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = Date.now() / 1000 + 2;
    const order2 = createOrder(2, OrderSide.Sell, OrderType.Limit, '10000', '1');
    order2.expiry = Date.now() / 1000 + 5;
    const orders = [order1, order2];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs, 1000);
  });

  it('time in force 5', async () => {
    jest.setTimeout(10000);
    const time = Date.now() / 1000;
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = time + 2.5;
    const order2 = createOrder(2, OrderSide.Buy, OrderType.Limit, '8000', '1');
    order2.expiry = time + 3;
    const order3 = createOrder(3, OrderSide.Sell, OrderType.Limit, '10000', '1');
    order3.expiry = time + 5;
    const orders = [order1, order2, order3];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order1), createOrderOutputCanceled(order2)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs, 1000);
  });

  it('time in force 6', async () => {
    jest.setTimeout(10000);
    const time = Date.now() / 1000;
    const order1 = createOrder(1, OrderSide.Buy, OrderType.Limit, '9000', '1');
    order1.expiry = time + 3;
    const order2 = createOrder(2, OrderSide.Buy, OrderType.Limit, '8000', '1');
    order2.expiry = time + 2.5;
    const order3 = createOrder(3, OrderSide.Sell, OrderType.Limit, '8000', '1');
    order3.expiry = time + 5;
    const orders = [order1, order2, order3];
    const orderOutputs: OrderOutput[] = [createOrderOutputCanceled(order2), createOrderOutputCanceled(order1)];
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
    ];
    await testMatching(orders, orderOutputs, orderbookOutputs, 1000);
  });
});
