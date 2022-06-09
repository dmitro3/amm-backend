import { BigNumber } from '@0x/utils';
import { Producer } from 'kafkajs';
import { kafka } from 'src/configs/kafka';
import { OrderEntity } from 'src/models/entities/order.entity';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrderOutput } from 'src/modules/matching-engine/entity/order-output';
import { OrderOutputAction } from 'src/modules/matching-engine/enum/order-output-action';
import { BaseOutputStream } from 'src/modules/matching-engine/output/base-output-stream';
import { Emitter } from 'src/modules/matching-engine/util/emitter';
import { OrdersService } from 'src/modules/orders/orders.service';
import { KafkaInputStream } from 'src/modules/ticker/input/kafka-input-stream';
import { TradeService } from 'src/modules/trades/trades.service';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { getConnection } from 'typeorm';
import { TransactionEntity, TransactionStatus, TransactionTypes } from 'src/models/entities/transaction.entity';
import { Network } from 'src/shares/enums/network';

export class OrderOutputStream extends BaseOutputStream<OrderOutput> {
  private orderService: OrdersService;
  private tradeService: TradeService;
  private emitter: Emitter;
  private producer: Producer;
  private readonly pairId: number;

  constructor(emitter: Emitter, tradeService: TradeService, orderService: OrdersService, pairId: number) {
    super();
    this.orderService = orderService;
    this.tradeService = tradeService;
    this.pairId = pairId;
    this.emitter = emitter;
  }

  public async connect(): Promise<boolean> {
    this.producer = kafka.producer();
    await this.producer.connect();
    return true;
  }

  public async publish(orderOutput: OrderOutput): Promise<void> {
    switch (orderOutput.action) {
      case OrderOutputAction.Match:
        await this.publicTrades(orderOutput);
        break;
      case OrderOutputAction.Cancel:
        await this.orderService.cancelOrder(orderOutput.order);
        break;
      default:
        throw new Error(`Invalid order action ${orderOutput.action}`);
    }
  }

  private async publicTrades(orderOutput: OrderOutput): Promise<void> {
    const savedTrades: TradeEntity[] = [];
    await getConnection('master').transaction(async (transaction) => {
      for (const trade of orderOutput.trades) {
        const tradePrepare = await this.prepareTrade(
          trade.buyOrder,
          trade.sellOrder,
          trade.buyerIsTaker,
          trade.price,
          trade.quantity,
        );

        trade.buyOrder.status = OrderEntity.getOrderStatus(trade.buyOrder);
        trade.sellOrder.status = OrderEntity.getOrderStatus(trade.sellOrder);
        await transaction.save([trade.buyOrder, trade.sellOrder]);

        const savedTrade = await transaction.save(tradePrepare);
        savedTrades.push(savedTrade);

        const newTxt = new TransactionEntity();
        newTxt.status = TransactionStatus.Pending;
        newTxt.type = TransactionTypes.Match;
        newTxt.network = Network.BSC;
        newTxt.rawId = savedTrade.id;
        await transaction.save(newTxt);
      }
    });

    this.emitter.emitTrades(savedTrades, this.pairId);
    await this.producer.send({
      topic: KafkaInputStream.getTopic(this.pairId),
      messages: [{ value: JSON.stringify(savedTrades) }],
    });
  }

  private async prepareTrade(
    buyOrder: OrderEntity,
    sellOrder: OrderEntity,
    buyerIsTaker: boolean,
    price: BigNumber,
    quantity: BigNumber,
  ): Promise<TradeEntity> {
    const newTrade = new TradeEntity();
    newTrade.pair_id = this.pairId;
    newTrade.buyer_is_taker = buyerIsTaker;
    newTrade.buy_user_id = buyOrder.user_id;
    newTrade.sell_user_id = sellOrder.user_id;
    newTrade.price = price.toString();
    newTrade.buy_order_id = buyOrder.id;
    newTrade.sell_order_id = sellOrder.id;
    newTrade.filled_amount = quantity.toString();
    newTrade.sell_fee = new BigNumber(sellOrder.getAmountIncludedFee(quantity)).times(sellOrder.fee_rate).toString();
    newTrade.buy_fee = new BigNumber(buyOrder.getAmountIncludedFee(quantity))
      .times(price)
      .times(buyOrder.fee_rate)
      .toString();
    newTrade.method = TradingMethod.BSCOrderbook;
    newTrade.buy_address = buyOrder.maker;
    newTrade.sell_address = sellOrder.maker;
    newTrade.method = TradingMethod.BSCOrderbook;
    newTrade.pool_id = undefined;
    newTrade.created_at = new Date();
    newTrade.updated_at = newTrade.created_at;
    return newTrade;
  }
}
