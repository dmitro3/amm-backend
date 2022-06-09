import { EntityRepository, Repository } from 'typeorm';
import { Coin } from 'src/models/entities/coin.entity';
import { IsActive } from 'src/shares/constants/constant';
import { Response } from 'src/shares/interceptors/response.interceptor';

@EntityRepository(Coin)
export class CoinRepository extends Repository<Coin> {
  async getAllCoins(): Promise<Coin[]> {
    return await this.createQueryBuilder('coins').select('*').where('coins.is_active = 1').getRawMany();
  }

  async getDigitalCreditSettings(
    digital_credit?: string,
    status?: number,
    page?: number,
    limit?: number,
  ): Promise<Response<Coin[]>> {
    const res = await this.createQueryBuilder('coins').select([
      'coins.name',
      'coins.symbol',
      'coins.stellar_issuer',
      'coins.bsc_address',
      'coins.is_active',
    ]);

    if (digital_credit) {
      res.where(`coins.name like "%${digital_credit}%"`);
    }
    if (status || status === 0) {
      res.andWhere(`coins.is_active = :status`, { status });
    }
    const [rs, total] = await Promise.all([
      res
        .limit(limit)
        .offset((page - 1) * limit)
        .getMany(),
      res.getCount(),
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

  async getBaseInfo(): Promise<Partial<Coin>[]> {
    return await this.find({
      select: ['symbol', 'stellar_issuer', 'bsc_address'],
      where: {
        is_active: IsActive.Active,
      },
    });
  }
}
