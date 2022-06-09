import { TradeEntity } from 'src/models/entities/trade.entity';
import { CollectedFeesDto } from 'src/modules/admin/dto/collected-fees.dto';
import { TradeEntityResponse } from 'src/modules/admin/dto/trade-entity-res.dto';
import { SearchTradeDto } from 'src/modules/orders/dto/search_trade.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { Brackets, EntityRepository, getManager, MoreThan, Repository } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { DownloadCollectedFeerequest } from 'src/modules/admin/dto/download-collected-fee-request.dto';

@EntityRepository(TradeEntity)
export class TradeRepository extends Repository<TradeEntity> {
  async getAllTradesLiqSwap(
    searchCondition: SearchTradeDto,
    page?: number,
    limit?: number,
  ): Promise<Response<Partial<TradeEntity[]>>> {
    const query = this.createQueryBuilder('trades')
      .select('trades.id', 'trade_id')
      .addSelect('trades.pair_id', 'pair_id')
      .addSelect('trades.buy_user_id', 'buy_user_id')
      .addSelect('trades.sell_user_id', 'sell_user_id')
      .addSelect('trades.updated_at', 'updated_at')
      .addSelect('trades.price', 'price')
      .addSelect('trades.filled_amount', 'filled_amount')
      .addSelect('trades.buy_amount', 'buy_amount')
      .addSelect('trades.sell_amount', 'sell_amount')
      .addSelect('trades.sell_fee', 'sell_fee')
      .addSelect('trades.buy_fee', 'buy_fee')
      .addSelect('trades.sell_address', 'sell_address')
      .addSelect('trades.buy_address', 'buy_address')
      .addSelect('trades.method', 'network')
      .addSelect('trades.buy_order_id', 'buy_order_id')
      .addSelect('trades.created_at', 'created_at')
      .addSelect('trades.sell_order_id', 'sell_order_id')
      .addSelect('trades.pool_id', 'pool_id')
      .addSelect('quote_coin.name', 'quote_name')
      .addSelect('base_coin.name', 'base_name')
      .innerJoin('pairs', 'pairs', 'trades.pair_id = pairs.id')
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id')
      .where('trades.method in (:method)', {
        method: searchCondition.tradeMethodTab,
      });
    if (searchCondition.userId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('trades.buy_user_id = :userId', {
            userId: searchCondition.userId,
          }).orWhere('trades.sell_user_id = :userId', { userId: searchCondition.userId });
        }),
      );
    }
    if (searchCondition.type) {
      query.andWhere('trades.method = :type', { type: searchCondition.type });
    }
    if (searchCondition.orderId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('trades.buy_order_id = :orderId', {
            orderId: searchCondition.orderId,
          }).orWhere('trades.sell_order_id = :orderId', { orderId: searchCondition.orderId });
        }),
      );
    }
    if (searchCondition.pool) {
      query.andWhere('trades.pool_id like :pool', {
        pool: `%${searchCondition.pool}%`,
      });
    }
    if (searchCondition.pair) {
      query.andWhere('trades.pair_id = :pairId', { pairId: searchCondition.pair });
    }
    if (searchCondition.coinId) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('base_coin.id = :coinId', {
            coinId: searchCondition.coinId,
          }).orWhere('quote_coin.id = :coinId', { coinId: searchCondition.coinId });
        }),
      );
    }
    if (searchCondition.startDate && searchCondition.endDate) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('UNIX_TIMESTAMP(trades.updated_at) >= UNIX_TIMESTAMP(:startDate)', {
            startDate: searchCondition.startDate,
          }).andWhere('UNIX_TIMESTAMP(trades.updated_at) <= UNIX_TIMESTAMP(:endDate)', {
            endDate: searchCondition.endDate,
          });
        }),
      );
    }
    const [rs, total] = await Promise.all([
      query
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy('trades.created_at', 'DESC')
        .getRawMany(),
      query.getCount(),
    ]);

    return {
      data: rs,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  side = {
    buy: 'buy',
    sell: 'sell',
  };

  getQuerySelect(isBuy: boolean): string {
    let query = `select t.id, ${isBuy ? `'${this.side.buy}'` : `'${this.side.sell}'`} as side, ${
      isBuy ? 't.buy_user_id' : 't.sell_user_id'
    } as user_id
      , t.buy_user_id
      , t.sell_user_id
      , t.updated_at
      , t.price
      , t.filled_amount
      , t.buy_amount
      , t.sell_amount
      , t.sell_fee
      , t.buy_fee
      , t.sell_address
      , t.buy_address
      , t.method as network
      , t.created_at as created_at
      , t.pair_id
      , ${isBuy ? 't.buy_order_id' : `'${''}'`} as buy_order_id
      , ${!isBuy ? 't.sell_order_id' : `'${''}'`} as sell_order_id
      , t.pool_id
      , quote_coin.name as quote_name
      , base_coin.name as base_name`;
    query += ' from trades as t';
    query += ' inner join pairs as pairs on t.pair_id = pairs.id';
    query += ' inner join coins as base_coin on base_coin.id = pairs.base_id';
    query += ' inner join coins as quote_coin on quote_coin.id = pairs.quote_id';
    return query;
  }
  async getAllTradesOrderBook(
    searchCondition: SearchTradeDto,
    page?: number,
    limit?: number,
  ): Promise<Response<Partial<TradeEntity[]>>> {
    const entityManager = getManager();
    const queryParams = [];
    queryParams.push(searchCondition.tradeMethodTab);
    let query = `select * from (${this.getQuerySelect(true)} union all ${this.getQuerySelect(false)}) as trades`;
    query += ' where trades.network in (?)';
    if (searchCondition.userId) {
      query += ' and trades.user_id = ?';
      queryParams.push(searchCondition.userId);
    }
    if (searchCondition.orderId) {
      query += ' and (trades.buy_order_id = ? or trades.sell_order_id = ?)';
      queryParams.push(searchCondition.orderId);
      queryParams.push(searchCondition.orderId);
    }
    if (searchCondition.pool) {
      query += ' and trades.pool_id like ?';
      queryParams.push(`%${searchCondition.pool}%`);
    }
    if (searchCondition.pair) {
      query += ' and trades.pair_id = ?';
      queryParams.push(searchCondition.pair);
    }
    if (searchCondition.coinId) {
      query += ' and (base_coin.id = ? or quote_coin.id = ?';
      queryParams.push(searchCondition.coinId);
      queryParams.push(searchCondition.coinId);
    }
    if (searchCondition.startDate && searchCondition.endDate) {
      query +=
        ' and (UNIX_TIMESTAMP(trades.updated_at) >= UNIX_TIMESTAMP(?) and UNIX_TIMESTAMP(trades.updated_at) <= UNIX_TIMESTAMP(?))';
      queryParams.push(searchCondition.startDate);
      queryParams.push(searchCondition.endDate);
    }
    const queryCount = query;
    const total = (
      await entityManager.query(`select count(trades.id) as count from (${queryCount}) as trades`, queryParams)
    )[0].count;

    query += ' order by trades.id desc';
    query += ' limit ?';
    query += ' offset ?';
    queryParams.push(limit);
    queryParams.push((page - 1) * limit);

    const rs = await entityManager.query(query, queryParams);
    rs.map((item) => {
      if (item.buy_user_id === item.sell_user_id) {
        if (item.side === this.side.buy) {
          item.sell_user_id = -1;
        } else {
          item.buy_user_id = -1;
        }
      }
    });

    return {
      data: rs,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async getTradesFromId(fromId: string): Promise<TradeEntity[]> {
    return this.find({
      where: {
        id: MoreThan(fromId),
      },
    });
  }

  async getTrades(request: CollectedFeesDto): Promise<TradeEntityResponse[]> {
    let startTime;
    let endTime;
    if (request.timestamps?.length) {
      startTime = request.timestamps.length ? request.timestamps[0] : 0;
      endTime = request.timestamps.length ? request.timestamps[request.timestamps.length - 1] : 0;
    } else {
      startTime = request.startTime || 0;
      endTime = request.endTime || 0;
    }
    const qr = this.querySelectTrades()
      .addSelect('trades.created_at', 'created_at')
      .where('trades.created_at >= :startTime', { startTime: new Date(startTime) })
      .andWhere('trades.created_at <= :endTime', { endTime: new Date(endTime) });
    if (request.methods) {
      qr.andWhere('trades.method IN (:methods)', { methods: request.methods });
    }

    if (request.pair) {
      qr.andWhere('trades.pair_id = :pair', { pair: request.pair });
    }
    if (request.poolAddress) {
      qr.andWhere('trades.pool_id = :poolId', { poolId: request.poolAddress });
    }
    qr.orderBy('trades.created_at', 'ASC');
    return qr.getRawMany();
  }

  async downloadCollectedFee(request: DownloadCollectedFeerequest): Promise<TradeEntityResponse[]> {
    const qr = this.querySelectTrades().addSelect('trades.created_at', 'created_at');
    if (request.method) {
      qr.andWhere('trades.method IN (:methods)', { methods: request.method });
    }
    if (request.startTime && request.endTime) {
      qr.andWhere('trades.created_at >= :startTime', { startTime: new Date(request.startTime) });
      qr.andWhere('trades.created_at <= :endTime', { endTime: new Date(request.endTime) });
    }
    if (request.pair) {
      qr.andWhere('trades.pair_id = :pair', { pair: request.pair });
    }
    if (request.poolAddress) {
      qr.andWhere('trades.pool_id = :poolId', { poolId: request.poolAddress });
    }
    qr.orderBy('trades.created_at', 'ASC');
    return qr.getRawMany();
  }

  private querySelectTrades(): SelectQueryBuilder<TradeEntity> {
    return this.createQueryBuilder('trades')
      .select('trades.id', 'trade_id')
      .addSelect('trades.pair_id', 'pair_id')
      .addSelect('trades.buy_user_id', 'buy_user_id')
      .addSelect('trades.sell_user_id', 'sell_user_id')
      .addSelect('trades.updated_at', 'updated_at')
      .addSelect('trades.price', 'price')
      .addSelect('trades.filled_amount', 'filled')
      .addSelect('trades.buy_amount', 'buy_amount')
      .addSelect('trades.sell_amount', 'sell_amount')
      .addSelect('trades.sell_fee', 'sell_fee')
      .addSelect('trades.buy_fee', 'buy_fee')
      .addSelect('trades.sell_address', 'sell_address')
      .addSelect('trades.buy_address', 'buy_address')
      .addSelect('trades.method', 'network')
      .addSelect('trades.buy_order_id', 'buy_order_id')
      .addSelect('trades.sell_order_id', 'sell_order_id')
      .addSelect('trades.pool_id', 'pool_id')
      .addSelect('quote_coin.name', 'quote_name')
      .addSelect('base_coin.name', 'base_name')
      .innerJoin('pairs', 'pairs', 'trades.pair_id = pairs.id')
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id');
  }
}
