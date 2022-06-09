import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { BigNumber } from '@0x/utils';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from 'src/modules/orders/dto/create_order.dto';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { contractAddress, OrderErrorStatus, OrderSide, OrderStatus, OrderType } from 'src/modules/orders/orders.const';
import { kafka } from 'src/configs/kafka';
import { SearchOrderDto } from 'src/modules/orders/dto/search_order.dto';
import { OrderEntity } from 'src/models/entities/order.entity';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { KafkaInputStream } from 'src/modules/matching-engine/input/kafka-input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { EventsGateway } from 'src/modules/events/event.gateway';
import { TradingFeeService } from 'src/modules/tradingfee/tradingfee.service';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { createLimitOrder } from 'src/shares/helpers/utils';
import { getConfig } from 'src/configs';
import { getConnection } from 'typeorm';
import { TransactionEntity, TransactionStatus, TransactionTypes } from 'src/models/entities/transaction.entity';
import { PairService } from 'src/modules/pairs/pair.service';
import { Network } from 'src/shares/enums/network';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { BalancesInOrderRes } from 'src/modules/orders/dto/res-balances.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(WalletRepository, 'report')
    public readonly userWalletRepoReport: WalletRepository,
    @InjectRepository(OrderRepository, 'report')
    public readonly orderRepoReport: OrderRepository,
    @InjectRepository(OrderRepository, 'master')
    public readonly orderRepoMaster: OrderRepository,
    private readonly tradingFeeService: TradingFeeService,
    private readonly pairService: PairService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // todo: Get an order by id
  async getOrderById(id: number): Promise<OrderEntity> {
    return await this.orderRepoMaster.findOne({
      where: { id },
    });
  }

  // todo: Get an order by order hash
  async getOrderByHash(orderHash: string): Promise<OrderEntity> {
    return await this.orderRepoMaster.findOne({
      where: { order_hash: orderHash },
    });
  }

  // todo: Push cancel order to queue kafka
  async pushCancelOrder(id: number, userIdCreated: number): Promise<OrderEntity> {
    const order = await this.getOrderById(id);

    if (order.method !== TradingMethod.BSCOrderbook) {
      throw new HttpException(
        { key: 'order.ONLY_CANCEL_BSC', code: OrderErrorStatus.OnlyCancelBSC },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!order) {
      throw new HttpException({ key: 'order.NOT_EXIST', code: OrderErrorStatus.NotExist }, HttpStatus.NOT_FOUND);
    }

    if (order.user_id !== userIdCreated) {
      throw new HttpException(
        { key: 'order.UNAUTHORIZED', code: OrderErrorStatus.Unauthorized },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (order.status === OrderStatus.Canceled) {
      throw new HttpException(
        { key: 'order.ALREADY_CANCEL', code: OrderErrorStatus.AlreadyCancel },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (order.status === OrderStatus.Fulfill) {
      throw new HttpException(
        { key: 'order.ALREADY_FULFILL', code: OrderErrorStatus.AlreadyFulfill },
        HttpStatus.BAD_REQUEST,
      );
    }

    const dataEnqueue = new OrderInput(OrderInputAction.Cancel, order);
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: KafkaInputStream.getTopic(order.pair_id),
      messages: [{ value: JSON.stringify(dataEnqueue) }],
    });

    return order;
  }

  async isValidMakerAmount(
    order: CreateOrderDto,
    amount: string,
    total: string,
    baseDecimal: BigNumber,
    quoteDecimal: BigNumber,
  ): Promise<boolean> {
    const ratio = new BigNumber(1).minus(new BigNumber(order.fee_rate));
    if (order.side === OrderSide.Buy) {
      const makerAmountForCheck = new BigNumber(total).times(ratio).times(quoteDecimal);
      return makerAmountForCheck.isEqualTo(order.maker_amounts);
    } else {
      const makerAmountForCheck = this.round(new BigNumber(amount).times(ratio).times(baseDecimal));
      return makerAmountForCheck.isEqualTo(order.maker_amounts);
    }
  }

  private round(n: BigNumber): BigNumber {
    return new BigNumber(n.toFixed(0, BigNumber.ROUND_FLOOR));
  }

  async isValidTakerAmount(
    order: CreateOrderDto,
    amount: string,
    total: string,
    baseDecimal: BigNumber,
    quoteDecimal: BigNumber,
  ): Promise<boolean> {
    const ratio = new BigNumber(1).minus(new BigNumber(order.fee_rate));
    if (order.side === OrderSide.Buy) {
      const takerAmountForCheck = this.round(new BigNumber(amount).times(ratio).times(baseDecimal));
      return takerAmountForCheck.isEqualTo(order.taker_amounts);
    } else {
      const takerAmountForCheck = new BigNumber(total).times(ratio).times(quoteDecimal);
      return takerAmountForCheck.isEqualTo(order.taker_amounts);
    }
  }

  async saveInvalidOrder(order: CreateOrderDto): Promise<void> {
    order.status = OrderStatus.Invalid;
    await this.orderRepoMaster.save(order);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    if (createOrderDto.method === TradingMethod.StellarOrderbook) {
      return await this.createStellarOrder(createOrderDto);
    }

    if (createOrderDto.method === TradingMethod.BSCOrderbook) {
      return await this.createBscOrder(createOrderDto);
    }

    throw new HttpException(
      { key: 'order.FAILED_CREATED', code: OrderErrorStatus.InvalidMethod },
      HttpStatus.BAD_REQUEST,
    );
  }

  private async createStellarOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const tradingFee = await this.tradingFeeService.getStellarTradingFee();
    createOrderDto.fee_rate =
      createOrderDto.type === OrderType.Limit ? tradingFee.limit_order : tradingFee.market_order;
    createOrderDto.status = OrderStatus.Fillable;

    const userWallet = await this.userWalletRepoReport.findOneByUserWallet(
      createOrderDto.maker,
      createOrderDto.user_id,
    );
    if (!userWallet) createOrderDto.maker = '';

    const order = await this.orderRepoMaster.save<CreateOrderDto>(createOrderDto);
    const socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(order.user_id));
    SocketEmitter.getInstance().emitOrders([order], socketId);
    if (!order) {
      throw new HttpException(
        { key: 'order.FAILED_CREATED', code: OrderErrorStatus.FailedCreated },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return order;
  }

  private async createBscOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const tradingFee = await this.tradingFeeService.getBscTradingFee();
    createOrderDto.fee_rate =
      createOrderDto.type === OrderType.Limit ? tradingFee.limit_order : tradingFee.market_order;
    createOrderDto.filled_amount = '0';
    createOrderDto.remaining_amount = new BigNumber('1')
      .minus(createOrderDto.fee_rate)
      .times(createOrderDto.amount)
      .toString();
    createOrderDto.status = OrderStatus.Pending;

    const pair = await this.pairService.getCoinByPairId(createOrderDto.pair_id);
    const baseDecimal = new BigNumber(10).pow(pair.base.decimal);
    const quoteDecimal = new BigNumber(10).pow(pair.quote.decimal);

    let isUsingTotal = false;
    if (createOrderDto.type == OrderType.Market) {
      isUsingTotal = new BigNumber(createOrderDto.total || '0').gt('0');
    }
    let amount = createOrderDto.amount;
    let total = new BigNumber(createOrderDto.amount).times(createOrderDto.price).toString();
    if (isUsingTotal) {
      amount = new BigNumber(createOrderDto.total).div(createOrderDto.price).toString();
      total = createOrderDto.total;
    }

    if (createOrderDto.side === OrderSide.Buy) {
      createOrderDto.taker_token_fee_amounts = new BigNumber(total)
        .times(createOrderDto.fee_rate)
        .times(quoteDecimal)
        .toString();
    } else {
      createOrderDto.taker_token_fee_amounts = this.round(
        new BigNumber(createOrderDto.fee_rate).times(amount).times(baseDecimal),
      ).toString();
    }

    if (!(await this.isValidMakerAmount(createOrderDto, amount, total, baseDecimal, quoteDecimal))) {
      await this.saveInvalidOrder(createOrderDto);
      throw new HttpException(
        { key: 'order.INVALID_MAKER_AMOUNT', code: OrderErrorStatus.InvalidMakerAmount },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!(await this.isValidTakerAmount(createOrderDto, amount, total, baseDecimal, quoteDecimal))) {
      await this.saveInvalidOrder(createOrderDto);
      throw new HttpException(
        { key: 'order.INVALID_TAKER_AMOUNT', code: OrderErrorStatus.InvalidTakerAmount },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!this.isOrderHashValid(createOrderDto)) {
      await this.saveInvalidOrder(createOrderDto);
      throw new HttpException(
        { key: 'order.INVALID_HASH', code: OrderErrorStatus.InvalidHash },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (![OrderSide.Buy, OrderSide.Sell].includes(createOrderDto.side)) {
      await this.saveInvalidOrder(createOrderDto);
      throw new HttpException(
        { key: 'order.INVALID_SIDE', code: OrderErrorStatus.InvalidSide },
        HttpStatus.BAD_REQUEST,
      );
    }

    const order = await this.orderRepoMaster.save(createOrderDto);

    if (!order) {
      throw new HttpException(
        { key: 'order.FAILED_CREATED', code: OrderErrorStatus.FailedCreated },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return order;
  }

  isOrderHashValid(order: CreateOrderDto): boolean {
    const chainId = getConfig().get<number>('chain_id');
    const matcherAddress = getConfig().get<string>('matcher_address');
    const limitOrder = createLimitOrder(order, matcherAddress, chainId, contractAddress.exchangeProxy);
    return limitOrder.getHash() === order.order_hash;
  }

  async getListOrders(searchCondition: SearchOrderDto, page?: number, limit?: number): Promise<{ data; metadata }> {
    return this.orderRepoReport.getListOrders(searchCondition, page, limit);
  }

  async getBalancesInOrders(userId: number, walletAddress?: string[]): Promise<BalancesInOrderRes[]> {
    return this.orderRepoReport.getBalancesInOrders(userId, walletAddress);
  }

  async cancelOrder(order: OrderEntity): Promise<void> {
    if (new BigNumber(order.filled_amount).isEqualTo(0)) order.status = OrderStatus.Canceled;
    else order.status = OrderStatus.PartiallyFilled;

    const newTxt = new TransactionEntity();
    newTxt.type = TransactionTypes.Cancel;
    newTxt.network = Network.BSC;
    newTxt.rawId = order.id;
    newTxt.status = TransactionStatus.Pending;

    await getConnection('master').transaction(async (transaction) => {
      await transaction.save(order);
      await transaction.save(newTxt);
    });

    const socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(order.user_id));
    SocketEmitter.getInstance().emitOrders([order], socketId);
  }

  async updatePendingOrderStatus(orderId: number, status: number): Promise<boolean> {
    const result = await this.orderRepoMaster
      .createQueryBuilder()
      .update('orders')
      .set({ status: status, updated_at: new Date() })
      .where('orders.id = :id', { id: orderId })
      .andWhere('orders.status = :status', { status: OrderStatus.Pending })
      .execute();
    return result.affected > 0;
  }

  async updateOrder(order: OrderEntity): Promise<OrderEntity> {
    return await this.orderRepoMaster.save(order);
  }

  async getFillableOrders(pairId: number): Promise<OrderEntity[]> {
    return this.orderRepoMaster.getFillableOrders(pairId);
  }

  async getOrderByStellarId(stellarId: string): Promise<OrderEntity> {
    return this.orderRepoMaster.findOne({ stellar_id: stellarId });
  }
}
