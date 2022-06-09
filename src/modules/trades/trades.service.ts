/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { SUBGRAPH_URL } from 'src/configs/network.config';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { EventsGateway } from 'src/modules/events/event.gateway';
import { SearchTradeDto } from 'src/modules/orders/dto/search_trade.dto';
import { TickerTrade } from 'src/modules/ticker/ticker.interface';
import { GetChartInfoDto } from 'src/modules/trades/dto/chart-info-request.dto';
import { TradeElement } from 'src/modules/trades/dto/trade-element.dto';
import { marketNumber, TRANSACTION_TYPE } from 'src/modules/trades/trades.constant';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { CallApi } from 'src/shares/helpers/call-api.helper';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { ConditionTransactionDto } from './dto/condition-transaction.dto';

export class TradeService {
  constructor(
    @InjectRepository(TradeRepository, 'master')
    public readonly tradeRepoMaster: TradeRepository,
    @InjectRepository(TradeRepository, 'report')
    public readonly tradeRepoReport: TradeRepository,
    @InjectRepository(TransactionRepository, 'master')
    public readonly tradeTxtRepoMaster: TransactionRepository,
    @InjectRepository(TransactionRepository, 'report')
    public readonly tradeTxtRepoReport: TransactionRepository,
    @InjectRepository(PairRepository, 'report')
    public readonly pairRepoReport: PairRepository,
    @InjectRepository(CoinRepository, 'report')
    public readonly coinRepoReport: CoinRepository,
    @InjectRepository(WalletRepository, 'report')
    public readonly walletRepoReport: WalletRepository,
    public readonly walletService: WalletService,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {}

  public async updateTxid(id: number, txid: string): Promise<void> {
    await this.tradeRepoMaster
      .createQueryBuilder()
      .update('trades')
      .set({ txid: txid })
      .where('trades.id = :id', { id })
      .execute();
    const trade = await this.tradeRepoMaster.findOne(id);
    if (trade) {
      let socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(trade.buy_user_id));
      await SocketEmitter.getInstance().emitUpdatedTrades(socketId);
      socketId = await this.cacheManager.get<string>(EventsGateway.getSocketIdKey(trade.sell_user_id));
      await SocketEmitter.getInstance().emitUpdatedTrades(socketId);
    }
  }

  async createStellarTrade(data: TradeEntity): Promise<TradeEntity> {
    return this.tradeRepoMaster.save(data);
  }

  async createManyTrade(data: TradeEntity[]): Promise<TradeEntity[]> {
    return this.tradeRepoMaster.save(data);
  }

  async prepareChartInfo(request: GetChartInfoDto): Promise<TradeElement[]> {
    const startTime = this.prepareTime(new Date(request.startTime));
    const endTime = this.prepareTime(new Date(request.endTime));
    const interval = request.interval;
    const response = await this.tradeRepoReport
      .createQueryBuilder('tra')
      .select(
        `(FLOOR(UNIX_TIMESTAMP(created_at)/:interval)*:interval)*1000 time
    , MIN(price) low
    , SUM(tra.filled_amount) volume
    , MAX(price) high
    , CAST(SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY created_at ASC SEPARATOR '|'),'|',1) AS DECIMAL(40,8)) AS 'open'
    , CAST(SUBSTRING_INDEX(GROUP_CONCAT(price ORDER BY created_at DESC SEPARATOR '|'),'|',1) AS DECIMAL(40,8)) AS 'close' 
     `,
      )
      .setParameter('interval', interval)
      .where('tra.created_at >= :startTime', { startTime: startTime })
      .andWhere('tra.pair_id = :pairId', { pairId: request.pairId })
      .andWhere('tra.created_at <= :endTime', { endTime: endTime })
      .andWhere('tra.method IN (:tradeNetwork)', { tradeNetwork: request.network })
      .groupBy('time')
      .getRawMany();
    return await this.addLostTime(response, request);
  }

  async addLostTime(responseArr: TradeElement[], request: GetChartInfoDto): Promise<TradeElement[]> {
    const tradeArray = [];
    for (let i = request.startTime; i < request.endTime; i += request.interval * 1000) {
      //TODO: need refactor to get the best performance
      const tradeElement = responseArr.filter((item) => item.time <= i && item.time > i - request.interval * 1000);
      if (tradeElement.length === 0) {
        if (i == request.startTime) {
          const nearnestTrade = await this.findNearestTrade(request);
          if (nearnestTrade) {
            const newBar = {
              open: nearnestTrade.price,
              close: nearnestTrade.price,
              high: nearnestTrade.price,
              low: nearnestTrade.price,
              volume: 0,
              time: i,
            };
            tradeArray.push(newBar);
          } else {
            tradeArray.push({
              open: 0,
              close: 0,
              high: 0,
              low: 0,
              volume: 0,
              time: i,
            });
          }
        } else {
          const endOfTradeArray = tradeArray[tradeArray.length - 1];
          tradeArray.push({
            open: endOfTradeArray.close,
            close: endOfTradeArray.close,
            high: endOfTradeArray.close,
            low: endOfTradeArray.close,
            time: i,
            volume: 0,
          });
        }
      } else {
        const trade = tradeElement[0];
        trade.time = Number(trade.time);
        trade.open = Number(trade.open);
        trade.close = Number(trade.close);
        trade.low = Number(trade.low);
        trade.high = Number(trade.high);
        trade.volume = Number(trade.volume);
        tradeArray.push(trade);
      }
    }
    for (let i = 0; i < tradeArray.length - 1; i++) {
      tradeArray[i + 1].open = tradeArray[i].close;
    }
    return tradeArray;
  }

  prepareTime(time: Date): string {
    const year = time.getFullYear();
    const month = time.getMonth();
    const day = time.getDate();
    const hours = time.getHours();
    const minute = time.getMinutes();
    const second = time.getSeconds();
    return `${year}-${month + 1}-${day} ${hours}:${minute}:${second}`;
  }

  async findNearestTrade(request: GetChartInfoDto): Promise<TradeEntity> {
    const startTime = this.prepareTime(new Date(request.startTime));
    return await this.tradeRepoReport
      .createQueryBuilder('tra')
      .where('tra.created_at <= :time', { time: startTime })
      .andWhere('tra.pair_id = :pairId', { pairId: request.pairId })
      .andWhere('tra.method IN (:tradeNetwork)', { tradeNetwork: request.network })
      .groupBy('tra.created_at')
      .orderBy('tra.created_at', 'DESC')
      .getOne();
  }

  async getAllTrades(searchCondition: SearchTradeDto, page?: number, limit?: number): Promise<Response<TradeEntity[]>> {
    if (Number(searchCondition.tradeMethodTab[0]) === TradingMethod.BSCPool) {
      return this.tradeRepoReport.getAllTradesLiqSwap(searchCondition, page, limit);
    } else {
      return this.tradeRepoReport.getAllTradesOrderBook(searchCondition, page, limit);
    }
  }

  public async getTrades(pairId: number, fromTime: number, toTime: number): Promise<TickerTrade[]> {
    return this.getTickerSelect()
      .where('UNIX_TIMESTAMP(trades.updated_at) >= :fromTime', {
        fromTime: fromTime,
      })
      .andWhere('UNIX_TIMESTAMP(trades.updated_at) <= :toTime', { toTime: toTime })
      .andWhere('trades.pair_id = :pairId', { pairId: pairId })
      .orderBy('trades.updated_at', 'ASC')
      .execute();
  }

  public async getFirstTradeBefore(time: number, pairId: number, method: TradingMethod): Promise<TickerTrade> {
    const result = await this.getTickerSelect()
      .andWhere('UNIX_TIMESTAMP(trades.updated_at) <= :toTime', { toTime: time })
      .andWhere('trades.pair_id = :pairId', { pairId: pairId })
      .andWhere('trades.method = :method', { method: method })
      .orderBy('trades.updated_at', 'DESC')
      .limit(1)
      .execute();
    return result.length > 0 ? result[0] : undefined;
  }

  private getTickerSelect(): SelectQueryBuilder<TickerTrade> {
    return this.tradeRepoReport
      .createQueryBuilder('trades')
      .select('trades.id', 'id')
      .addSelect('trades.price', 'price')
      .addSelect('trades.pair_id', 'pair_id')
      .addSelect('trades.filled_amount', 'filled_amount')
      .addSelect('trades.method', 'method')
      .addSelect('trades.updated_at', 'updated_at');
  }

  async getMarketTrades(pairId: number, method: TradingMethod): Promise<TradeEntity[]> {
    return this.tradeRepoReport
      .createQueryBuilder('trades')
      .select(['trades.price', 'trades.buyer_is_taker', 'trades.filled_amount', 'trades.created_at', 'trades.method'])
      .where('trades.pair_id = :pairId', { pairId: pairId })
      .andWhere('trades.method = :method', { method: method })
      .orderBy('trades.created_at', 'DESC')
      .limit(marketNumber)
      .getMany();
  }

  async getTradeWithId(id: number): Promise<TradeEntity> {
    return await this.tradeRepoReport.findOne(id);
  }

  async getQuerySubGraph(condition: ConditionTransactionDto): Promise<unknown> {
    let wallet;
    if (condition.userId) {
      wallet = await this.walletRepoReport.find({ user_id: condition.userId });
    } else {
      wallet = await this.walletRepoReport.find();
    }
    const walletAddress = wallet.map((w) => `"${w.address}"`);

    const coin = await this.coinRepoReport.findOne(condition.coinId);
    const coinAddress = coin.bsc_address;

    const queryGetAdd = {
      query: `{
        adds (
          orderBy: timestamp ,
          orderDirection: desc,
          skip: ${(condition.page - 1) * condition.limit}
          first: ${condition.limit}
          where: {
            userAddress_in: [${walletAddress}]
            ${
              condition.startDate && condition.endDate
                ? `, timestamp_gte: ${condition.startDate} && timestamp_lte: ${condition.endDate}`
                : ''
            }
            ${condition.pool ? `, poolAddress_contains: "${condition.pool}"` : ''}
            ${condition.coinId ? `, tokenIn_contains:"${coinAddress}"` : ''}
          }) {
          id tokens {id tokenIn tokenInSym tokenAmountIn addAddress{id}}
          poolAddress{id}
          userAddress{id}
          timestamp
          caller
        }
      }`,
    };

    const queryGetRemove = {
      query: `{
        withdraws (
          orderBy: timestamp ,
          orderDirection: desc,
          skip: ${(condition.page - 1) * condition.limit}
          first: ${condition.limit * condition.page}
          where: {
            userAddress_in: [${walletAddress}]
            ${
              condition.startDate && condition.endDate
                ? `, timestamp_gte: ${condition.startDate} && timestamp_lte: ${condition.endDate}`
                : ''
            }
            ${condition.pool ? `, poolAddress_contains: "${condition.pool}"` : ''}
            ${condition.coinId ? `, tokenIn_contains:"${coinAddress}"` : ''}
          }) {
          id
          tokens {
            id
            tokenOut
            tokenOutSym
            tokenAmountOut
           withdrawAddress{
              id
            }
          }
          poolAddress{
            id
          }
          userAddress{id}
          timestamp
          caller
        }
      }`,
    };
    switch (condition.transactionType) {
      case TRANSACTION_TYPE.Add:
        return queryGetAdd;
      case TRANSACTION_TYPE.Remove:
        return queryGetRemove;
      default:
        break;
    }
  }

  async getTradeLiquidity(condition: ConditionTransactionDto): Promise<unknown> {
    const query = await this.getQuerySubGraph(condition);

    const [transaction] = await Promise.all([CallApi(SUBGRAPH_URL, query, 'POST')]);

    let transactionResponse = [];
    if (transaction.ok) {
      const res = await transaction.json();
      let data;
      if (condition.transactionType === TRANSACTION_TYPE.Add) {
        data = [...res.data.adds];
      } else {
        data = [...res.data.withdraws];
      }
      await Promise.all(
        data.map(async (item) => {
          const userId = await this.walletService.getUserIdByWalletAccount(item.userAddress.id);
          item.user_id = userId;
          console.log(item);
          // return item;
        }),
      );
      if (res.data !== undefined) {
        transactionResponse = data;
      }
    }
    return transactionResponse;
  }
}
