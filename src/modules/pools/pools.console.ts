import { BigNumber } from '@0x/utils';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Producer } from 'kafkajs';
import { Console, Command } from 'nestjs-console';
import { kafka } from 'src/configs/kafka';
import { OrderEntity } from 'src/models/entities/order.entity';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { EventsGateway } from 'src/modules/events/event.gateway';
import { LatestBlockCoin, LatestBlockType } from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { BSC_BLOCK_TIME, OrderSide, OrderStatus, OrderType } from 'src/modules/orders/orders.const';
import { WrapPool } from 'src/modules/pools/dto/wrap-pool.dto';
import { KafkaInputStream } from 'src/modules/ticker/input/kafka-input-stream';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { querySubGraph } from 'src/shares/helpers/subgraph';
import { sleep } from 'src/shares/helpers/utils';
import { Connection } from 'typeorm';

@Console()
export class PoolConsole {
  private readonly logger = new Logger(PoolConsole.name);

  private producer: Producer;
  private pairMapByKey: { [key: string]: PairCoin } = {};
  private pairMapById: { [key: string]: PairCoin } = {};

  constructor(
    @InjectRepository(PairRepository, 'report')
    public readonly pairRepoReport: PairRepository,
    @InjectRepository(TradeRepository, 'master')
    public readonly tradeRepoMaster: TradeRepository,
    @InjectRepository(OrderRepository, 'master')
    public readonly orderRepoMaster: OrderRepository,
    @InjectRepository(WalletRepository, 'report')
    public readonly userWalletRepoReport: WalletRepository,
    private readonly latestBlockService: LatestBlockService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectConnection('master')
    private connection: Connection,
  ) {}

  @Command({
    command: 'crawl-pool-swaps',
    description: 'Crawl pool swaps',
  })
  async crawlPoolSwaps(): Promise<void> {
    this.logger.setContext(`${PoolConsole.name}.crawlPoolSwaps`);
    this.producer = kafka.producer();
    await this.producer.connect();
    await this.loadPairs();
    const latestBlock = await this.latestBlockService.getLatestBlock(LatestBlockCoin.bsc, LatestBlockType.PoolSwaps);
    let time = Number(latestBlock.block || '0');

    while (true) {
      const swaps = await this.fetchSwaps(time);
      this.emitSwaps(swaps);

      if (swaps.length > 0) {
        time = swaps[swaps.length - 1].timestamp;
      }

      const calculatedSwaps = await this.calculateSwapInfo(swaps);
      this.logger.log(`Got ${calculatedSwaps.length} new FCX swaps`);

      if (calculatedSwaps.length === 0) {
        await sleep(BSC_BLOCK_TIME);
        if (swaps.length > 0) {
          await this.latestBlockService.saveLatestBlock(
            LatestBlockCoin.bsc,
            LatestBlockType.PoolSwaps,
            time.toString(),
          );
        }
        continue;
      }

      const userAddresses = calculatedSwaps.map((swap) => swap.userAddress.id);
      const userWalletMap = await this.getUserWallets(userAddresses);
      await this.saveSwaps(calculatedSwaps, userWalletMap);
      await this.latestBlockService.saveLatestBlock(LatestBlockCoin.bsc, LatestBlockType.PoolSwaps, time.toString());
    }
  }

  private async fetchSwaps(from: number): Promise<WrapPool[]> {
    this.logger.log(`Get swaps from ${from}`);
    const response = await this.callGraphql(from);
    const json = await response.json();
    const swaps = json?.data?.swaps || [];
    this.logger.log(`Got ${swaps.length} new swaps`);
    return swaps;
  }

  private group<T>(items: Array<T>, field: string): { [key: string]: T[] } {
    const result: { [key: string]: T[] } = {};

    for (const item of items) {
      const key = item[field];
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }

    return result;
  }

  private async saveSwaps(calculatedSwaps: WrapPool[], userWalletMap: { [key: string]: number }): Promise<void> {
    await this.connection.transaction(async (manager) => {
      const orders: OrderEntity[] = [];
      const orderMap: { [key: string]: number } = {};
      for (const swap of calculatedSwaps) {
        const order = this.convertToFCXOrder(swap, userWalletMap);
        const savedOrder = await manager.save(OrderEntity, order);
        orderMap[swap.id] = savedOrder.id;
        orders.push(savedOrder);
      }
      const trades = calculatedSwaps.map((item: WrapPool) => {
        return this.convertToFCXTrade(item, userWalletMap, orderMap);
      });
      await manager.save(TradeEntity, trades);
      await this.emitOrdersAndTrades(orders, trades);
    });
  }

  private emitSwaps(swaps: WrapPool[]): void {
    const groupedSwaps = {};
    for (const swap of swaps) {
      const pairKey = `${swap.tokenInSym}/${swap.tokenOutSym}`;
      const reversedPairKey = `${swap.tokenOutSym}/${swap.tokenInSym}`;
      const pairId = this.pairMapByKey[pairKey]?.pairs_id || this.pairMapByKey[reversedPairKey]?.pairs_id;
      if (!pairId) {
        continue;
      }
      if (!groupedSwaps[pairId]) {
        groupedSwaps[pairId] = [];
      }
      groupedSwaps[pairId].push(swap);
    }
    for (const pairId in groupedSwaps) {
      SocketEmitter.getInstance().emitSwaps(groupedSwaps[pairId], Number(pairId));
    }
  }

  private async emitOrdersAndTrades(orders: OrderEntity[], trades: TradeEntity[]): Promise<void> {
    const groupedOrders = this.group(orders, 'user_id');
    for (const userId in groupedOrders) {
      const socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(Number(userId)));
      SocketEmitter.getInstance().emitOrders(groupedOrders[userId], socketId);
    }

    const groupedTrades = this.group(trades, 'pair_id');
    for (const pairId in groupedTrades) {
      await this.producer.send({
        topic: KafkaInputStream.getTopic(Number(pairId)),
        messages: [{ value: JSON.stringify(groupedTrades[pairId]) }],
      });
      SocketEmitter.getInstance().emitTrades(groupedTrades[pairId], Number(pairId));
    }
  }

  private calculateSwapInfo(swaps: WrapPool[]): WrapPool[] {
    const convertedSwaps = [];
    for (const swap of swaps) {
      const pairKey = `${swap.tokenInSym}/${swap.tokenOutSym}`;
      const reversedPairKey = `${swap.tokenOutSym}/${swap.tokenInSym}`;
      const convertedSwap = {
        id: swap.id,
        timestamp: swap.timestamp,
        userAddress: {
          id: swap.userAddress.id,
        },
        poolAddress: {
          id: swap.poolAddress.id,
        },
      };
      if (this.pairMapByKey[pairKey]) {
        convertedSwaps.push({
          ...convertedSwap,
          pairId: this.pairMapByKey[pairKey].pairs_id,
          price: this.convertToPrice(swap.tokenAmountOut, swap.tokenAmountIn),
          tokenAmountIn: swap.tokenAmountIn,
          tokenAmountOut: swap.tokenAmountOut,
          tokenInSym: swap.tokenInSym,
          tokenOutSym: swap.tokenOutSym,
          isBuy: false,
          feeValue: swap.feeValue,
        });
      } else if (this.pairMapByKey[reversedPairKey]) {
        convertedSwaps.push({
          ...convertedSwap,
          pairId: this.pairMapByKey[reversedPairKey].pairs_id,
          price: this.convertToPrice(swap.tokenAmountIn, swap.tokenAmountOut),
          tokenAmountIn: swap.tokenAmountOut,
          tokenAmountOut: swap.tokenAmountIn,
          timestamp: swap.timestamp,
          tokenInSym: swap.tokenOutSym,
          tokenOutSym: swap.tokenInSym,
          feeValue: swap.feeValue,
          isBuy: true,
        });
      }
    }
    return convertedSwaps;
  }

  private async callGraphql(time: number): Promise<Response> {
    const query = {
      query: `{swaps (
      orderBy: timestamp ,
      orderDirection: asc, 
      where: {
        timestamp_gt: ${time},
      }) {
      id
      caller
      tokenIn
      tokenOut
      tokenInSym
      tokenOutSym
      timestamp
      tokenAmountIn
      tokenAmountOut
      poolAddress {
        id
      }
      userAddress {
        id
      }
      value
      feeValue
      poolTotalSwapFee
      poolTotalSwapVolume
      poolLiquidity
    }}`,
    };

    return querySubGraph(query);
  }

  convertToPrice(a: string, b: string): string {
    return new BigNumber(a).div(b).toString();
  }

  async loadPairs(): Promise<void> {
    const pairs = await this.pairRepoReport.getAllPairs();
    pairs.forEach((item) => {
      this.pairMapByKey[`${item.base_symbol}/${item.quote_symbol}`] = item;
      this.pairMapById[item.pairs_id] = item;
    });
  }

  private convertToFCXTrade(
    tradeElement: WrapPool,
    userWalletMap: { [key: string]: number },
    orderMap?: { [key: string]: number },
  ): TradeEntity {
    const trade = new TradeEntity();
    trade.pair_id = tradeElement.pairId;
    trade.price = tradeElement.price;
    trade.filled_amount = tradeElement.tokenAmountIn;
    if (tradeElement.isBuy) {
      trade.buy_user_id = userWalletMap[tradeElement.userAddress.id];
      trade.sell_user_id = -1;
      trade.buy_address = tradeElement.userAddress.id;
      trade.sell_address = undefined;
      trade.buy_order_id = orderMap[tradeElement.id];
      trade.sell_order_id = -1;
      trade.sell_fee = '0';
      trade.buy_fee = tradeElement.feeValue;
      trade.buyer_is_taker = true;
    } else {
      trade.buy_user_id = -1;
      trade.sell_user_id = userWalletMap[tradeElement.userAddress.id];
      trade.buy_address = undefined;
      trade.sell_address = tradeElement.userAddress.id;
      trade.buy_order_id = -1;
      trade.sell_order_id = orderMap[tradeElement.id];
      trade.sell_fee = tradeElement.feeValue;
      trade.buy_fee = '0';
      trade.buyer_is_taker = false;
    }
    trade.method = TradingMethod.BSCPool;
    trade.pool_id = tradeElement.poolAddress.id;
    trade.created_at = new Date(tradeElement.timestamp * 1000);
    trade.updated_at = new Date(tradeElement.timestamp * 1000);
    return trade;
  }

  private convertToFCXOrder(poolElement: WrapPool, userWalletMap: { [key: string]: number }): OrderEntity {
    const order = new OrderEntity();
    order.pair_id = poolElement.pairId;
    order.pool_id = poolElement?.poolAddress.id;
    order.user_id = userWalletMap[poolElement.userAddress.id];
    order.price = poolElement.price;
    order.average = poolElement.price;
    order.created_at = new Date(poolElement.timestamp * 1000);
    order.updated_at = new Date(poolElement.timestamp * 1000);
    order.maker = poolElement.userAddress.id;
    order.method = TradingMethod.BSCPool;
    order.status = OrderStatus.Fulfill;
    order.filled_amount = poolElement.tokenAmountIn;
    order.remaining_amount = '0';
    order.amount = poolElement.tokenAmountIn;
    order.side = poolElement.isBuy ? OrderSide.Buy : OrderSide.Sell;
    order.type = OrderType.Market;
    return order;
  }

  async getUserWallets(userAddresses: Array<string>): Promise<{ [key: string]: number }> {
    const userWallets = await this.userWalletRepoReport.findAllWalletByAddress(userAddresses);
    const userWalletMap = {};
    userWallets.forEach((item) => {
      userWalletMap[item.address] = item.user_id;
    });
    return userWalletMap;
  }
}
