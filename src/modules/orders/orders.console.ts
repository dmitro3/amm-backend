// eslint-disable-next-line
const Web3 = require('web3');
import { BigNumber } from '@ethersproject/bignumber';
import { Command, Console } from 'nestjs-console';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { STELLAR_HORIZON } from 'src/configs/network.config';
import { kafka } from 'src/configs/kafka';
import { ContractEvent } from 'src/modules/contracts/constants';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { ZeroExContract } from 'src/modules/orders/helper/zero-ex-contract';
import { PairService } from 'src/modules/pairs/pair.service';
import { OfferService } from 'src/modules/orders/offer.service';
import { LatestBlockCoin, LatestBlockType } from 'src/modules/latest-block/latest-block.const';
import { crawlBscEvents } from 'src/shares/helpers/bsc';
import { convertToPairMap } from 'src/shares/helpers/stellar';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { StellarOffer } from 'src/shares/interfaces/stellar-offer';
import { contractAddress, OrderStatus, STELLAR_SLEEP_TIME, STELLAR_LIMIT } from 'src/modules/orders/orders.const';
import { OrdersService } from 'src/modules/orders/orders.service';
import { OrderInputAction } from 'src/modules/matching-engine/enum/order-input-action';
import { KafkaInputStream } from 'src/modules/matching-engine/input/kafka-input-stream';
import { OrderInput } from 'src/modules/matching-engine/entity/order-input';
import { OrderEntity } from 'src/models/entities/order.entity';
import { createLimitOrder, sleep } from 'src/shares/helpers/utils';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { EventsGateway } from 'src/modules/events/event.gateway';
import { StellarOperation } from 'src/shares/interfaces/stellar-operation';
import { KafkaTopic } from 'src/shares/enums/kafka';
import { zeroExABI } from 'src/modules/contracts/abi/zeroExABI';
import { getConfig } from 'src/configs';

const stellarHorizon = STELLAR_HORIZON;

@Console()
@Injectable()
export class OrdersConsole {
  private producer = null;
  private pairMap = {};
  private web3;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly latestBlockService: LatestBlockService,
    private readonly offerService: OfferService,
    private readonly pairService: PairService,
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.logger.setContext(OrdersConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
  }

  @Command({
    command: 'crawl-stellar-offers',
    description: 'Crawl Stellar offers',
  })
  async crawlStellarOffers(): Promise<void> {
    const latestBlock = await this.latestBlockService.getLatestBlock(LatestBlockCoin.stellar, LatestBlockType.offer);
    let cursor = latestBlock?.block || '0';
    await this.initPairs();

    while (true) {
      const response = await fetch(`${stellarHorizon.url}/offers?cursor=${cursor}&limit=${STELLAR_LIMIT}`);
      const data = await response.json();
      const offers = data._embedded?.records || [];
      this.logger.log(`Got ${offers.length} new offers`);
      for (const offer of offers) {
        this.logger.log(`Got offer ${offer.id}`);
        cursor = offer.paging_token;
        if (this.isFcxOffer(offer)) {
          this.logger.log(`Processing offer ${offer.id}`);
          await this.waitOfferIfNeeded(offer.id);
          await this.offerService.createOrUpdateStellarOffer(offer.id, this.findPair(offer));
          await this.latestBlockService.saveLatestBlock(LatestBlockCoin.stellar, LatestBlockType.offer, cursor);
        }
      }
      if (offers.length > 0) {
        await this.latestBlockService.saveLatestBlock(LatestBlockCoin.stellar, LatestBlockType.offer, cursor);
      }
      if (offers.length < STELLAR_LIMIT) {
        await sleep(STELLAR_SLEEP_TIME);
      }
    }
  }

  private async waitOfferIfNeeded(offerId: string): Promise<void> {
    for (let i = 0; i < 3; i++) {
      if (await this.offerService.isStellarOfferExisted(offerId)) {
        break;
      } else {
        this.logger.log(`Offer doesn't exist, sleeping 1000 ms`);
        await sleep(1000); // wait for client submit order to backend
      }
    }
  }

  @Command({
    command: 'crawl-stellar-operations',
    description: 'Crawl Stellar operations',
  })
  async crawlStellarOperations(): Promise<void> {
    this.producer = kafka.producer();
    await this.producer.connect();
    const latestBlock = await this.latestBlockService.getLatestBlock(
      LatestBlockCoin.stellar,
      LatestBlockType.Operations,
    );
    let cursor = latestBlock?.block || '0';
    await this.initPairs();

    while (true) {
      const response = await fetch(`${stellarHorizon.url}/operations?cursor=${cursor}&limit=${STELLAR_LIMIT}`);
      const data = await response.json();
      const operations = data._embedded?.records || [];
      this.logger.log(`Got ${operations.length} new operations`);
      for (const operation of operations) {
        switch (operation.type) {
          case 'manage_buy_offer':
          case 'manage_sell_offer':
          case 'create_passive_sell_offer':
            await this.processOfferOperation(operation);
            break;
          default:
            // nothing to do
            break;
        }
        cursor = operation.paging_token;
      }
      if (operations.length > 0) {
        await this.latestBlockService.saveLatestBlock(LatestBlockCoin.stellar, LatestBlockType.Operations, cursor);
        this.logger.log(`Last processed operation: ${cursor}`);
      }
      if (operations.length < STELLAR_LIMIT) {
        await sleep(STELLAR_SLEEP_TIME);
      }
    }
  }

  private async processOfferOperation(operation: StellarOperation): Promise<void> {
    if (this.isFcxOperation(operation)) {
      this.logger.log(`Processing operation ${operation.id}`);
      const pair = this.findOperationPair(operation);
      if (Number(operation.offer_id) > 0) {
        await this.offerService.createOrUpdateStellarOffer(operation.offer_id, pair);
      }
      await this.latestBlockService.saveLatestBlock(
        LatestBlockCoin.stellar,
        LatestBlockType.Operations,
        operation.paging_token,
      );
      await this.producer.send({
        topic: KafkaTopic.StellarOrderbook,
        messages: [{ value: pair.pairs_id.toString() }],
      });
    }
  }

  private async initPairs(): Promise<void> {
    const pairs = await this.pairService.getAllPairs();
    this.pairMap = convertToPairMap(pairs);
  }

  private findPair(offer: StellarOffer): PairCoin {
    const pairKey = this.getPairKey(offer);
    return this.pairMap[pairKey];
  }

  private getPairKey(offer: StellarOffer): string {
    const {
      buying: { asset_type: base_asset_type, asset_code: base_asset_code = '', asset_issuer: base_asset_issuer = '' },
      selling: {
        asset_type: counter_asset_type,
        asset_code: counter_asset_code = '',
        asset_issuer: counter_asset_issuer = '',
      },
    } = offer;
    const baseKey = `${base_asset_type}_${base_asset_code}_${base_asset_issuer}`;
    const counterKey = `${counter_asset_type}_${counter_asset_code}_${counter_asset_issuer}`;
    return `${baseKey}_${counterKey}`;
  }

  private isFcxOffer(offer: StellarOffer): boolean {
    return !!this.findPair(offer);
  }

  private isFcxOperation(operation: StellarOperation): boolean {
    return !!this.findOperationPair(operation);
  }

  private findOperationPair(operation: StellarOperation): PairCoin {
    const pairKey = this.getOperationPairKey(operation);
    return this.pairMap[pairKey];
  }

  private getOperationPairKey(operation: StellarOperation): string {
    const {
      buying_asset_type,
      buying_asset_code,
      buying_asset_issuer,
      selling_asset_type,
      selling_asset_code,
      selling_asset_issuer,
    } = operation;
    const buyingKey = `${buying_asset_type}_${buying_asset_code}_${buying_asset_issuer}`;
    const sellingKey = `${selling_asset_type}_${selling_asset_code}_${selling_asset_issuer}`;
    return `${buyingKey}_${sellingKey}`;
  }

  async activeOrder(order: OrderEntity): Promise<boolean> {
    if (order.status !== OrderStatus.Pending) {
      this.logger.log('Order status is not pending');
      return false;
    }

    order.status = OrderStatus.Fillable;
    order.updated_at = new Date();
    await this.ordersService.updateOrder(order);

    const dataEnqueue = new OrderInput(OrderInputAction.Create, order);

    await this.producer.send({
      topic: KafkaInputStream.getTopic(order.pair_id),
      messages: [{ value: JSON.stringify(dataEnqueue) }],
    });

    const socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(order.user_id));
    await SocketEmitter.getInstance().emitOrders([order], socketId);

    return true;
  }

  @Command({
    command: 'activate-orders',
  })
  async activateOrders(): Promise<void> {
    this.producer = kafka.producer();
    await this.producer.connect();

    const contract = new this.web3.eth.Contract(zeroExABI, contractAddress.exchangeProxy);
    const eventHandler = async (event): Promise<void> => {
      this.logger.log(`Processing event ${JSON.stringify(event)}`);
      this.logger.log(`Handle order with hash ${event.returnValues.orderHash}`);
      const data = await this.ordersService.getOrderByHash(event.returnValues.orderHash);
      if (!data) this.logger.log(`Cannot find order with hash ${event.returnValues.orderHash}`);
      else await this.activeOrder(data);
    };
    await crawlBscEvents(this.web3, this.latestBlockService, contract, ContractEvent.LockedBalanceOrder, eventHandler);
  }

  @Command({
    command: 'get-bsc-order-status <orderHash>',
  })
  async getBscOrderStatus(orderHash: string): Promise<void> {
    const locked: BigNumber = await ZeroExContract.getInstance().getOrderLocked(orderHash);
    const filled = await ZeroExContract.getInstance().getOrderLocked(orderHash);
    console.log({
      hash: orderHash,
      locked: locked.div(BigNumber.from(10).pow(18)).toString(),
      filled: filled.div(BigNumber.from(10).pow(18)).toString(),
    });
  }

  @Command({
    command: 'get-bsc-order-hash <block>',
  })
  async getBscOrderHash(block: string): Promise<void> {
    const contract = new this.web3.eth.Contract(zeroExABI, contractAddress.exchangeProxy);
    const params = { fromBlock: block, toBlock: block };
    const events = await contract.getPastEvents('LockedBalanceOrder', params);
    for (const event of events) {
      console.log({
        address: event.address,
        transactionHash: event.transactionHash,
        orderHash: event.returnValues.orderHash,
      });
    }
  }

  @Command({
    command: 'get-bsc-order-info <id>',
  })
  async getBscOrderInfo(id: number): Promise<void> {
    const matcherAddress = getConfig().get<string>('matcher_address');
    const chainId = getConfig().get<number>('chain_id');
    const order = await this.ordersService.getOrderById(id);
    const limitLeftOrder = createLimitOrder(order, matcherAddress, chainId, contractAddress.exchangeProxy);

    console.log(`Database order ${JSON.stringify(order)}`);
    console.log(`BSC order ${JSON.stringify(limitLeftOrder)}`);
    console.log(`BSC hash ${limitLeftOrder.getHash()}`);
  }
}
