import { BigNumber } from 'bignumber.js';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { EntityRepository, In, Repository } from 'typeorm';
import { OrderEntity } from 'src/models/entities/order.entity';
import { SearchOrderDto } from 'src/modules/orders/dto/search_order.dto';
import { OrderSide, OrderStatus } from 'src/modules/orders/orders.const';
import { BalancesInOrderRes } from 'src/modules/orders/dto/res-balances.dto';

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity> {
  async getListOrders(searchCondition: SearchOrderDto, page?: number, limit?: number): Promise<{ data; metadata }> {
    const qb = this.createQueryBuilder('orders')
      .select('orders.id', 'id')
      .addSelect('orders.pair_id', 'pair_id')
      .addSelect('orders.created_at', 'created_at')
      .addSelect('orders.type', 'type')
      .addSelect('orders.side', 'side')
      .addSelect('orders.price', 'price')
      .addSelect('orders.amount', 'amount')
      .addSelect('orders.total', 'total')
      .addSelect('orders.taker_amounts', 'taker_amounts')
      .addSelect('orders.maker_amounts', 'maker_amounts')
      .addSelect('orders.filled_amount', 'filled_amount')
      .addSelect('orders.pool_id', 'pool_id')
      .addSelect('orders.user_id', 'user_id')
      .addSelect('orders.stellar_id', 'stellar_id')
      .addSelect('orders.method', 'method')
      .addSelect('orders.maker', 'address')
      .addSelect('orders.status', 'status')
      .addSelect('orders.average', 'average')
      .addSelect('quote_coin.name', 'quote_name')
      .addSelect('base_coin.name', 'base_name')
      .innerJoin('pairs', 'pairs', 'orders.pair_id = pairs.id')
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id');
    qb.where('1=1');
    if (searchCondition.userId) {
      qb.andWhere('orders.user_id = :userId', { userId: searchCondition.userId });
    }
    if (searchCondition.status) {
      qb.andWhere('orders.status in (:status)', { status: searchCondition.status });
    }
    if (searchCondition.pair) {
      qb.andWhere('orders.pair_id = :pairId', { pairId: searchCondition.pair });
    }
    if (searchCondition.method) {
      qb.andWhere('orders.method in (:method)', { method: searchCondition.method });
    }
    if (searchCondition.wallet) {
      qb.andWhere('orders.address = :wallet', { wallet: searchCondition.wallet });
    }
    // const count = await res.getCount();
    // res.limit(ORDER_LIST_LIMIT);
    const [rs, total] = await Promise.all([
      qb
        .limit(limit)
        .offset((page - 1) * limit)
        .orderBy('orders.created_at', 'DESC')
        .getRawMany(),
      qb.getCount(),
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

  async getBalancesInOrders(userId: number, wallet: string[]): Promise<BalancesInOrderRes[]> {
    const qb = this.createQueryBuilder('orders')
      .select('orders.id', 'id')
      .addSelect('orders.pair_id', 'pair_id')
      .addSelect('orders.type', 'type')
      .addSelect('orders.side', 'side')
      .addSelect('orders.price', 'price')
      .addSelect('orders.amount', 'amount')
      .addSelect('orders.filled_amount', 'filled_amount')
      .addSelect('orders.user_id', 'user_id')
      .addSelect('orders.maker', 'address')
      .addSelect('orders.status', 'status')
      .addSelect('orders.average', 'average')
      .addSelect('quote_coin.name', 'quote_name')
      .addSelect('base_coin.name', 'base_name')
      .innerJoin('pairs', 'pairs', 'orders.pair_id = pairs.id')
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id')
      .where('orders.user_id = :userId', { userId })
      .andWhere('orders.status in (:...status)', {
        status: [OrderStatus.Fillable, OrderStatus.Filling],
      });
    if (wallet?.length) {
      qb.andWhere('orders.maker in (:...wallet)', { wallet });
    }

    const rs = await qb.getRawMany();

    // get base quote => value
    const res = rs.map((order) => ({
      side: order.side,
      symbol: order.side === OrderSide.Sell ? order.base_name : order.quote_name,
      address: order.address,
      total:
        order.side === OrderSide.Sell
          ? new BigNumber(order.amount).minus(new BigNumber(order.filled_amount))
          : new BigNumber(order.price).times(new BigNumber(order.amount).minus(new BigNumber(order.filled_amount))),
    }));
    const resMap = res.reduce((arr, item) => {
      const index = arr.findIndex((v) => v.address === item.address && v.symbol === item.symbol);
      if (index !== -1) {
        arr.splice(index, 1, {
          value: new BigNumber(arr[index]?.value || 0).plus(new BigNumber(item.total)).toNumber(),
          symbol: item.symbol,
          address: item.address,
        });
      } else {
        arr.push({
          value: new BigNumber(item.total).toNumber(),
          symbol: item.symbol,
          address: item.address,
        });
      }
      return arr;
    }, []);

    // sum total coin in-order
    return resMap;
  }

  async getFillableOrders(pairId: number): Promise<OrderEntity[]> {
    return this.find({
      where: {
        pair_id: pairId,
        method: TradingMethod.BSCOrderbook,
        status: In([OrderStatus.Fillable, OrderStatus.Filling]),
      },
    });
  }

  async findOneByStellarId(offerId: string): Promise<OrderEntity> {
    return this.findOne({ where: { stellar_id: offerId } });
  }

  async isStellarOfferExisted(offerId: string): Promise<boolean> {
    return (await this.count({ stellar_id: offerId })) > 0;
  }
}
