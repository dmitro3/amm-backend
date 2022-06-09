import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';
import { OrderSide } from 'src/modules/orders/orders.const';
import { createOrderbookOutput, getOrderbookAmount, testOrderbook } from 'src/modules/matching-engine/util/helper';

describe('Orderbook', () => {
  let cacheManager: Cache;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({})],
    }).compile();
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('matching limit 1', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    const expect = {
      bids: [{ price: '9000', amount: getOrderbookAmount('1') }],
      asks: [{ price: '10000', amount: getOrderbookAmount('1') }],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 2', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    const expect = {
      bids: [],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 3', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '2'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    const expect = {
      bids: [{ price: '9000', amount: getOrderbookAmount('1') }],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 4', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [{ price: '9000', amount: getOrderbookAmount('1') }],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 5', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '3'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '-1'),
    ];
    const expect = {
      bids: [{ price: '9000', amount: getOrderbookAmount('1') }],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 6', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
    ];
    const expect = {
      bids: [{ price: '9000', amount: getOrderbookAmount('1') }],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 7', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '-1'),
    ];
    const expect = {
      bids: [{ price: '9000', amount: getOrderbookAmount('1') }],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('matching limit 8', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '-1'),
    ];
    const expect = {
      bids: [],
      asks: [{ price: '10000', amount: getOrderbookAmount('1') }],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 9', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
    ];
    const expect = {
      bids: [
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 10', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
    ];
    const expect = {
      bids: [
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 11', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '2'),
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '-1'),
    ];
    const expect = {
      bids: [
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 12', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
      createOrderbookOutput(OrderSide.Buy, '11000', '1'),
    ];
    const expect = {
      bids: [
        { price: '11000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 13', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
      createOrderbookOutput(OrderSide.Buy, '9000', '1'),
    ];
    const expect = {
      bids: [
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '9000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 13', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Buy, '10000', '1'),
      createOrderbookOutput(OrderSide.Buy, '8000', '1'),
      createOrderbookOutput(OrderSide.Buy, '6000', '1'),
      createOrderbookOutput(OrderSide.Buy, '5000', '1'),
    ];
    const expect = {
      bids: [
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '5000', amount: getOrderbookAmount('1') },
      ],
      asks: [],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 14', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 15', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 16', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '2'),
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '-1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 17', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
      createOrderbookOutput(OrderSide.Sell, '11000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
        { price: '11000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 18', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
      createOrderbookOutput(OrderSide.Sell, '9000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '9000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });

  it('test 19', async () => {
    const orderbookOutputs: OrderbookOutput[] = [
      createOrderbookOutput(OrderSide.Sell, '10000', '1'),
      createOrderbookOutput(OrderSide.Sell, '8000', '1'),
      createOrderbookOutput(OrderSide.Sell, '6000', '1'),
      createOrderbookOutput(OrderSide.Sell, '5000', '1'),
    ];
    const expect = {
      bids: [],
      asks: [
        { price: '5000', amount: getOrderbookAmount('1') },
        { price: '6000', amount: getOrderbookAmount('1') },
        { price: '8000', amount: getOrderbookAmount('1') },
        { price: '10000', amount: getOrderbookAmount('1') },
      ],
      updated_at: Date.now(),
    };
    await testOrderbook(cacheManager, orderbookOutputs, expect);
  });
});
