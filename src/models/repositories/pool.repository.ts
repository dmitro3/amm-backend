import { PoolRequestFilterDto } from 'src/modules/admin/dto/pool-request-filter.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { EntityRepository, Repository } from 'typeorm';
import { PoolEntity } from 'src/models/entities/pool.entity';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

@EntityRepository(PoolEntity)
export class PoolRepository extends Repository<PoolEntity> {
  private createPoolRequestQuery(): SelectQueryBuilder<PoolEntity> {
    return this.createQueryBuilder('pools')
      .leftJoinAndSelect('pools.pool_coins', 'coins')
      .leftJoinAndSelect('pools.user', 'user');
  }

  private selectPoolColumns(query: SelectQueryBuilder<PoolEntity>): SelectQueryBuilder<PoolEntity> {
    return query.select([
      'pools.id',
      'pools.user_id',
      'pools.type',
      'pools.swap_fee',
      'pools.fee_ratio_velo',
      'pools.fee_ratio_lp',
      'pools.status',
      'pools.flex_right_config',
      'pools.pool_address',
      'pools.created_at',
      'coins.coin_id',
      'coins.weight',
      'user.email',
      'user.user_type',
    ]);
  }

  private createPoolRequestFilter(
    filter: PoolRequestFilterDto,
    page?: number,
    limit?: number,
  ): SelectQueryBuilder<PoolEntity> {
    const res = this.selectPoolColumns(this.createPoolRequestQuery());
    const {
      digital_credit: digitalCredit,
      type,
      user_type: userType,
      status,
      user_id: userId,
      create_at_sort: sort,
    } = filter;

    if (digitalCredit) {
      res.andWhere(`coins.coin_id = :digitalCredit`, { digitalCredit });
    }
    if (type) {
      res.andWhere(`pools.type = :type`, { type });
    }
    if (status) {
      res.andWhere(`pools.status = :status`, { status });
    }
    if (userType || userType === 0) {
      res.andWhere(`user.user_type = :userType`, { userType });
    }
    if (userId) {
      res.andWhere(`pools.user_id = :userId`, { userId });
    }
    res.orderBy('pools.created_at', sort);
    return res.limit(limit).offset((page - 1) * limit);
  }

  async getPoolRequests(filter: PoolRequestFilterDto, page?: number, limit?: number): Promise<Response<PoolEntity[]>> {
    const { create_at_sort: sort } = filter;
    const rawPoolIds = await this.createPoolRequestFilter(filter, page, limit)
      .select('DISTINCT(pools.id)')
      .limit(limit)
      .offset((page - 1) * limit)
      .getRawMany();
    const poolIds = rawPoolIds.map((item) => item.id);

    const [rs, total] = await Promise.all([
      this.selectPoolColumns(this.createPoolRequestQuery())
        .whereInIds(poolIds)
        .orderBy('pools.created_at', sort)
        .getMany(),
      this.createPoolRequestFilter(filter, page, limit).getCount(),
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

  async getPoolRequest(id): Promise<PoolEntity> {
    const res = this.createPoolRequestQuery();
    res.where('pools.id = :id', { id });
    return res.getOne();
  }
}
