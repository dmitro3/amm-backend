import { BigNumber } from '@0x/utils';
import { AsyncBlockingQueue } from 'src/modules/matching-engine/util/async-blocking-queue';
import { OrderEntity } from 'src/models/entities/order.entity';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OrderbookOutput } from 'src/modules/matching-engine/entity/orderbook-output';
import { MatchingEngineConfig } from 'src/modules/matching-engine/engine/matching-engine-config';
import { InputStream } from 'src/modules/matching-engine/input/input-stream';
import { InputStreamFactory } from 'src/modules/matching-engine/input/input-stream-factory';
import { OutputStream } from 'src/modules/matching-engine/output/output-stream';
import { OutputStreamFactory } from 'src/modules/matching-engine/output/output-stream-factory';
import { MatchingEngineAction } from 'src/modules/matching-engine/enum/matching-engine-action';
import { OrderOutputAction } from 'src/modules/matching-engine/enum/order-output-action';
import { Trade } from 'src/modules/matching-engine/entity/trade';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { MATCHING_ENGINE_PRECISION } from 'src/modules/matching-engine/util/helper';
import { OrderSide } from 'src/modules/orders/orders.const';
import { FastPriorityQueue } from 'src/modules/matching-engine/util/fast-priority-queue';
import { Logger } from '@nestjs/common';
import { sleep } from 'src/shares/helpers/utils';

export class MatchingEngine {
  private sellOrders = new FastPriorityQueue((order1: OrderEntity, order2: OrderEntity) => {
    const priceComparedResult = new BigNumber(order1.price).comparedTo(order2.price);
    if (priceComparedResult < 0) return true;
    if (priceComparedResult > 0) return false;

    const dateComparedResult = new Date(order1.updated_at).getTime() - new Date(order2.updated_at).getTime();
    if (dateComparedResult < 0) return true;
    if (dateComparedResult > 0) return false;

    return this.ordersPriority.get(order1.id) < this.ordersPriority.get(order2.id);
  });
  private buyOrders = new FastPriorityQueue((order1: OrderEntity, order2: OrderEntity) => {
    const priceComparedResult = new BigNumber(order1.price).comparedTo(order2.price);
    if (priceComparedResult > 0) return true;
    if (priceComparedResult < 0) return false;

    const dateComparedResult = new Date(order1.updated_at).getTime() - new Date(order2.updated_at).getTime();
    if (dateComparedResult < 0) return true;
    if (dateComparedResult > 0) return false;

    return this.ordersPriority.get(order1.id) < this.ordersPriority.get(order2.id);
  });

  protected unprocessedOrders: AsyncBlockingQueue<OrderInput> = new AsyncBlockingQueue<OrderInput>();
  // TODO clear this map somehow
  protected receivedOrders: Map<number, OrderInputAction> = new Map();
  protected orderOutputs: AsyncBlockingQueue<OrderOutput> = new AsyncBlockingQueue<OrderOutput>();
  protected orderbookOutputs: AsyncBlockingQueue<OrderbookOutput> = new AsyncBlockingQueue<OrderbookOutput>();

  protected currentOrderPriority = 0;
  // We create a unique priority when starting to process each order
  // and remove priority when order is fully matched or canceled
  protected ordersPriority: Map<number, number> = new Map();

  private orderExpiryQueue = new FastPriorityQueue((order1: OrderEntity, order2: OrderEntity) => {
    return order1.expiry - order2.expiry < 0;
  });

  protected config: MatchingEngineConfig;
  protected logger = new Logger(MatchingEngine.name);

  public async initialize(config: MatchingEngineConfig): Promise<void> {
    this.config = config;
    this.startInputThread(config);
    await this.startOrderOutputThread(config);
    await this.startOrderbookOutputThread(config);
  }

  protected startInputThread(config: MatchingEngineConfig): void {
    const inputStream: InputStream<OrderInput> = InputStreamFactory.createInputStream(config);
    inputStream.setOnNewDataCallback((orderAction: OrderInput) => {
      this.onNewOrderAction(orderAction);
    });
    inputStream.connect();
  }

  protected async startOrderOutputThread(config: MatchingEngineConfig): Promise<void> {
    const outputStream: OutputStream<OrderOutput> = OutputStreamFactory.createOrderOutputStream(config);
    await outputStream.connect();
    setTimeout(async () => {
      while (true) {
        const data: OrderOutput = await this.orderOutputs.dequeue();
        await outputStream.publish(data);
      }
    }, 0);
  }

  protected async startOrderbookOutputThread(config: MatchingEngineConfig): Promise<void> {
    const outputStream: OutputStream<OrderbookOutput> = OutputStreamFactory.createOrderbookOutputStream(config);
    await outputStream.connect();
    setTimeout(async () => {
      while (true) {
        const data: OrderbookOutput = await this.orderbookOutputs.dequeue();
        await outputStream.publish(data);
      }
    }, 0);
  }

  public onNewOrderAction(orderInput: OrderInput): void {
    this.log(`Add action: ${orderInput}`);

    const oldAction = this.receivedOrders.get(orderInput.order.id);
    if (oldAction === undefined) {
      if (orderInput.isActionCreate()) {
        this.processCreateAction(orderInput);
      } else if (orderInput.isActionCancel()) {
        this.log(`Order hasn't been processed before`);
        this.cancelOrder(orderInput.order, false);
      } else {
        throw new Error(`Unknown order action: ${oldAction}`);
      }
      return;
    }
    if (OrderInputAction.Cancel === oldAction) {
      this.log('Order is already canceled');
      return;
    }

    if (OrderInputAction.Create === oldAction) {
      if (orderInput.isActionCancel()) {
        this.receivedOrders.set(orderInput.order.id, orderInput.action);
        this.unprocessedOrders.enqueue(orderInput);
        return;
      } else if (orderInput.isActionCreate()) {
        this.log('Order is already processed');
      } else {
        this.log(`Unknown order action: ${orderInput.action}`);
      }
    } else {
      throw new Error(`Unknown order action: ${oldAction}`);
    }
  }

  private processCreateAction(orderInput: OrderInput): void {
    this.ordersPriority.set(orderInput.order.id, this.currentOrderPriority++);
    this.receivedOrders.set(orderInput.order.id, orderInput.action);
    this.unprocessedOrders.enqueue(orderInput);
  }

  public async preProcess(orderInputs: OrderInput[]): Promise<void> {
    this.log(`Start preprocessing ${orderInputs.length} orders`);
    for (const orderInput of orderInputs) {
      this.processCreateAction(orderInput);
    }
    this.log(`Finish preprocessing ${orderInputs.length} orders`);
  }

  public async start(): Promise<void> {
    if (this.config.isTesting) {
      await sleep(10);
    }
    while (true) {
      const action: MatchingEngineAction = await this.onTick();
      if (MatchingEngineAction.Stop === action) {
        await sleep(10);
        break;
      }
    }
  }

  protected async onTick(): Promise<MatchingEngineAction> {
    if (this.config.isTesting) {
      if (this.unprocessedOrders.isEmpty()) {
        return MatchingEngineAction.Stop;
      } else {
        await sleep(this.config.sleepTime);
      }
    }

    this.cancelExpiredOrders();

    if (!this.unprocessedOrders.isEmpty()) {
      const orderInput: OrderInput = await this.unprocessedOrders.dequeue();
      if (orderInput.isActionCreate()) {
        this.processOrder(orderInput.order);
      } else {
        this.cancelOrder(orderInput.order);
      }
    } else {
      await sleep(this.config.sleepTime);
    }
    return MatchingEngineAction.Continue;
  }

  protected cancelOrder(order: OrderEntity, addedToOrderbook = true): void {
    this.log('Cancel order: ' + order);
    const orderQueue = this.getPendingOrdersQueue(order.side);

    this.removeOrderFromQueue(order, orderQueue);
    this.ordersPriority.delete(order.id);
    this.removeOrderFromQueue(order, this.orderExpiryQueue);
    this.orderOutputs.enqueue(new OrderOutput(OrderOutputAction.Cancel, [], order));
    if (addedToOrderbook) {
      this.addOrderbookEvent(order.side, order.price, new BigNumber(order.remaining_amount).times('-1').toString());
    }
  }

  protected cancelExpiredOrders(): void {
    while (!this.orderExpiryQueue.isEmpty()) {
      const order = this.orderExpiryQueue.peek();
      if (order.isExpired()) {
        this.log('Cancel expired order ' + order);
        this.cancelOrder(order);
      } else {
        break;
      }
    }
  }

  protected processOrder(order: OrderEntity): void {
    this.log('Process order: ' + order);

    if (order.isExpired()) {
      this.log('Order expired ' + order);
      this.cancelOrder(order, false);
      return;
    }
    let maxTotal = order.isUsingTotal()
      ? new BigNumber(order.getMatchableTotal())
      : new BigNumber(Number.MAX_SAFE_INTEGER);

    const trades: Trade[] = [];

    const orderQueue = this.getPendingOrdersQueue(order.getOppositeSide());
    let candidate: OrderEntity;
    while (order.canMatching(maxTotal) && !orderQueue.isEmpty()) {
      candidate = orderQueue.peek();
      if (order.canBeMatchedWith(candidate)) {
        this.log('Candidate ' + candidate + ' can be matched');
        orderQueue.poll();
        const trade: Trade = this.matchOrders(order, candidate, maxTotal);
        trades.push(trade);
        maxTotal = this.subtractMaxTotalIfNeeded(maxTotal, order, trade);

        this.addOrderbookEvent(candidate.side, trade.price.toString(), trade.quantity.multipliedBy(-1).toString());

        if (candidate.canMatching()) {
          this.getPendingOrdersQueue(candidate.side).add(candidate);
        } else {
          this.ordersPriority.delete(candidate.id);
          this.removeOrderFromQueue(candidate, this.orderExpiryQueue);
        }
      } else {
        this.log('Candidate ' + candidate + ' cannot be matched');
        break;
      }
    }

    if (trades.length > 0) {
      this.orderOutputs.enqueue(new OrderOutput(OrderOutputAction.Match, trades, undefined));
    }

    if (order.isMarketOrder()) {
      // cancel the remaining if needed
      if (order.canMatching(maxTotal)) {
        this.orderOutputs.enqueue(new OrderOutput(OrderOutputAction.Cancel, [], order));
      }
      this.ordersPriority.delete(order.id);
    } else {
      if (order.canMatching()) {
        this.getPendingOrdersQueue(order.side).add(order);
        this.orderExpiryQueue.add(order);
        this.addOrderbookEvent(order.side, order.price, order.remaining_amount);
      } else {
        this.ordersPriority.delete(order.id);
      }
    }
  }

  protected getPendingOrdersQueue(side: OrderSide): FastPriorityQueue<OrderEntity> {
    if (OrderSide.Buy === side) {
      return this.buyOrders;
    } else {
      return this.sellOrders;
    }
  }

  protected matchOrders(taker: OrderEntity, maker: OrderEntity, maxTotal: BigNumber): Trade {
    let buyOrder: OrderEntity;
    let sellOrder: OrderEntity;
    let buyerIsTaker = false;

    if (taker.isBuyOrder()) {
      buyOrder = taker;
      sellOrder = maker;
      buyerIsTaker = true;
    } else {
      buyOrder = maker;
      sellOrder = taker;
    }

    const price: BigNumber = this.getMatchingPrice(taker, maker);
    const quantity: BigNumber = this.getMatchingQuantity(taker, maker, maxTotal, price);

    const trade: Trade = new Trade(buyOrder, sellOrder, price, quantity, buyerIsTaker);
    this.updateAverageAndFilledAmount(buyOrder, price, quantity);
    this.updateAverageAndFilledAmount(sellOrder, price, quantity);

    this.log('Trade: ' + trade);

    return trade;
  }

  protected getMatchingQuantity(
    taker: OrderEntity,
    maker: OrderEntity,
    maxTotal: BigNumber,
    price: BigNumber,
  ): BigNumber {
    let takerQuantity = taker.remaining_amount;
    if (taker.isUsingTotal()) {
      takerQuantity = maxTotal.div(price).toFixed(MATCHING_ENGINE_PRECISION, BigNumber.ROUND_FLOOR);
    }
    return BigNumber.min(takerQuantity, maker.remaining_amount);
  }

  protected getMatchingPrice(taker: OrderEntity, maker: OrderEntity): BigNumber {
    return new BigNumber(maker.price);
  }

  protected calculateNewAverage(order: OrderEntity, price: string, quantity: string): string {
    const total = new BigNumber(order.average || '0')
      .times(order.filled_amount || '0')
      .plus(new BigNumber(price).times(quantity));
    return total.div(new BigNumber(order.filled_amount).plus(quantity)).toString();
  }

  protected updateAverageAndFilledAmount(order: OrderEntity, price: BigNumber, quantity: BigNumber): void {
    order.average = this.calculateNewAverage(order, price.toString(), order.getAmountIncludedFee(quantity));
    order.filled_amount = new BigNumber(order.filled_amount).plus(order.getAmountIncludedFee(quantity)).toString();
    if (!order.isUsingTotal()) {
      order.remaining_amount = new BigNumber(order.remaining_amount).minus(quantity).toString();
    }
  }

  protected subtractMaxTotalIfNeeded(maxTotal: BigNumber, order: OrderEntity, trade: Trade): BigNumber {
    if (order.isUsingTotal()) {
      maxTotal = maxTotal.minus(new BigNumber(trade.price).times(trade.quantity));
    }
    return maxTotal;
  }

  protected removeOrderFromQueue(order: OrderEntity, queue: FastPriorityQueue<OrderEntity>): void {
    // TODO check remove
    queue.removeOne((item) => {
      return item.id === order.id;
    });
  }

  private log(message: string): void {
    this.logger.log(message);
  }

  protected addOrderbookEvent(side: OrderSide, price: string, quantity: string): void {
    const orderbookOutput: OrderbookOutput = new OrderbookOutput(side, price, quantity);
    this.orderbookOutputs.enqueue(orderbookOutput);
  }

  public getBuyOrders(): FastPriorityQueue<OrderEntity> {
    return this.buyOrders;
  }

  public getSellOrders(): FastPriorityQueue<OrderEntity> {
    return this.sellOrders;
  }

  public getOrdersPriority(): Map<number, number> {
    return this.ordersPriority;
  }

  public getOrderExpiryQueue(): FastPriorityQueue<OrderEntity> {
    return this.orderExpiryQueue;
  }
}
