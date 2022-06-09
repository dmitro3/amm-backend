import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BigNumber } from 'bignumber.js';
import { Cache } from 'cache-manager';
import { STELLAR_HORIZON } from 'src/configs/network.config';
import { OrderEntity } from 'src/models/entities/order.entity';
import { TradingFee } from 'src/models/entities/trading-fee.entity';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { EventsGateway } from 'src/modules/events/event.gateway';
import {
  getAverage,
  getCreatedAt,
  getFilledAmounts,
  getFilledTotal,
  getOfferAccount,
  getOfferAmount,
  getOfferMaker,
  getOfferPrice,
  isBuyOffer,
} from 'src/modules/orders/offer.helper';
import { OrderSide, OrderStatus, OrderType } from 'src/modules/orders/orders.const';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { TradingFeeService } from 'src/modules/tradingfee/tradingfee.service';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { StellarOffer } from 'src/shares/interfaces/stellar-offer';
import { StellarTrade } from 'src/shares/interfaces/stellar-trade';
import { TransactionEntity, TransactionStatus, TransactionTypes } from 'src/models/entities/transaction.entity';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { Network } from 'src/shares/enums/network';
import { isEqual, STELLAR_EPSILON } from 'src/modules/matching-engine/util/helper';

@Injectable()
export class OfferService {
  private readonly logger = new Logger(OfferService.name);
  private stellarTradingFee: TradingFee;

  constructor(
    @InjectRepository(TransactionRepository, 'master')
    private readonly transactionRepoMaster: TransactionRepository,
    @InjectRepository(OrderRepository, 'master')
    private readonly orderRepoMaster: OrderRepository,
    @InjectRepository(OrderRepository, 'report')
    private readonly orderRepoReport: OrderRepository,
    private readonly tradingFeeService: TradingFeeService,
    private readonly walletService: WalletService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createStellarOffer(data: OrderEntity): Promise<OrderEntity> {
    return this.orderRepoMaster.save(data);
  }

  public async isStellarOfferExisted(id: string): Promise<boolean> {
    return this.orderRepoMaster.isStellarOfferExisted(id);
  }

  public async isStellarOffersExisted(stellarTrade: StellarTrade): Promise<boolean> {
    return (
      (await this.isStellarOfferExisted(stellarTrade.base_offer_id)) &&
      (await this.isStellarOfferExisted(stellarTrade.counter_offer_id))
    );
  }

  public async createOrUpdateStellarOffers(stellarTrade: StellarTrade, pair: PairCoin): Promise<void> {
    await this.createOrUpdateStellarOffer(stellarTrade.base_offer_id, pair);
    await this.createOrUpdateStellarOffer(stellarTrade.counter_offer_id, pair);
  }

  public async createOrUpdateStellarOffer(offerId: string, pair: PairCoin): Promise<void> {
    this.logger.log(`createOrUpdateStellarOffer ${offerId}`);
    if (!this.stellarTradingFee) {
      await this.loadTradingFee();
    }
    const [offer, trades] = await Promise.all([this.getStellarOffer(offerId), this.getStellarTrades(offerId)]);
    let order = await this.orderRepoMaster.findOneByStellarId(offerId);
    const { filledAmount, amount, status } = this.getOrderInfo(order, offer, trades, pair);

    if (!order) {
      this.logger.log(`Create new order for offer ${offerId}`);
      const stellarAccount = getOfferAccount(offer, trades, offerId.toString());
      const userId = await this.walletService.getUserIdByWalletAccount(stellarAccount);
      if (!userId) {
        this.logger.log(`Cannot find user id for stellar account ${stellarAccount}`);
        return;
      }
      order = this.createEmptyOrder();
      order.user_id = userId;
      order.stellar_id = offerId;
      order.pair_id = pair.pairs_id;
      order.method = TradingMethod.StellarOrderbook;
      order.side = isBuyOffer(offer, trades, offerId, pair) ? OrderSide.Buy : OrderSide.Sell;
      order.price = getOfferPrice(offer, trades, pair);
      order.average = getAverage(trades, pair);
      order.filled_amount = filledAmount;
      order.amount = amount;
      order.maker = getOfferMaker(offer, trades, offerId);
      order.fee_rate = this.stellarTradingFee.limit_order;
      order.created_at = getCreatedAt(offer, trades);
      order.updated_at = order.created_at;
      order.status = status;
      order = await this.orderRepoMaster.save(order);
    } else {
      this.logger.log(`Update filled_amount for order(${order.id}): ${filledAmount}`);
      order.filled_amount = filledAmount;
      order.average = getAverage(trades, pair);
      order.updateStellarAmountIfNeeded(amount);
      order.status = status;
      await this.orderRepoMaster.save(order);
    }
    if (status === OrderStatus.Canceled || status === OrderStatus.PartiallyFilled) {
      const newTx = new TransactionEntity();
      newTx.type = TransactionTypes.Cancel;
      newTx.network = Network.Stellar;
      newTx.rawId = order.id;
      newTx.status = TransactionStatus.Pending;
      await this.transactionRepoMaster.save(newTx);
    }
    const socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(order.user_id));
    SocketEmitter.getInstance().emitOrders([order], socketId);
  }

  private async getStellarTrades(offerId: string): Promise<StellarTrade[]> {
    const response = await fetch(`${STELLAR_HORIZON.url}/trades?offer_id=${offerId}&limit=200`);
    const data = await response.json();

    //TODO get more trades if needed
    return data._embedded.records;
  }

  private async getStellarOffer(offerId: string): Promise<StellarOffer> {
    const response = await fetch(`${STELLAR_HORIZON.url}/offers/${offerId}`);
    return await response.json();
  }

  private createEmptyOrder(): OrderEntity {
    const order = new OrderEntity();
    order.remaining_amount = '-1'; // we don't care remaining amount of stellar order
    order.sender = '';
    order.status = OrderStatus.Fillable;
    order.type = OrderType.Limit;

    return order;
  }

  private getOrderInfo(
    order: OrderEntity,
    offer: StellarOffer,
    trades: StellarTrade[],
    pair: PairCoin,
  ): { filledAmount: string; amount: string; status: OrderStatus } {
    const isLimitOrder = order?.type !== OrderType.Market;
    const feeRate = this.getFeeRate(order, isLimitOrder);
    const filledAmount = this.getOriginAmount(getFilledAmounts(trades, pair), feeRate);
    const remainingAmount = this.getOriginAmount(getOfferAmount(offer, pair) || '0', feeRate);
    const amount = new BigNumber(filledAmount).plus(remainingAmount).toString();
    let status: OrderStatus;
    if (offer.id) {
      status = new BigNumber(filledAmount).eq('0') ? OrderStatus.Fillable : OrderStatus.Filling;
    } else {
      if (new BigNumber(filledAmount).eq('0')) status = OrderStatus.Canceled;
      else {
        const isUsingTotal = new BigNumber(order?.total || 0).gt(0);
        if (isUsingTotal) {
          const filledTotal = this.getOriginAmount(getFilledTotal(trades, pair), feeRate);
          const isFulfilled = isEqual(filledTotal, order?.total, STELLAR_EPSILON);
          status = isFulfilled ? OrderStatus.Fulfill : OrderStatus.PartiallyFilled;
        } else {
          status = isEqual(filledAmount, order?.amount || '0') ? OrderStatus.Fulfill : OrderStatus.PartiallyFilled;
        }
      }
    }

    return { filledAmount, amount, status };
  }

  private async loadTradingFee(): Promise<void> {
    this.stellarTradingFee = await this.tradingFeeService.getStellarTradingFee();
    if (!this.stellarTradingFee) {
      throw new Error(`Invalid system setting: cannot find Stellar trading fee`);
    }
  }

  private getFeeRate(order: OrderEntity, isLimitOrder = true): string {
    if (order?.fee_rate) {
      return order.fee_rate;
    }

    return isLimitOrder ? this.stellarTradingFee.limit_order : this.stellarTradingFee.market_order;
  }

  private getOriginAmount(n: string, feeRate: string): string {
    const rate = new BigNumber('1').minus(feeRate).toString();
    return new BigNumber(n).div(rate).toString();
  }
}
