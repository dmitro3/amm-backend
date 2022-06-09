import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { EntityRepository, Repository, SelectQueryBuilder } from 'typeorm';
import { PairEntity } from 'src/models/entities/pair.entity';
import { PairFilterDto } from 'src/modules/pairs/dto/pairfilter.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';

@EntityRepository(PairEntity)
export class PairRepository extends Repository<PairEntity> {
  async getAllPairs(): Promise<PairCoin[]> {
    return await this.getBaseQueryForPairCoin().getRawMany();
  }

  getBaseQueryForPairCoin(): SelectQueryBuilder<PairEntity> {
    return this.createQueryBuilder('pairs')
      .select([
        'pairs.id',
        'pairs.price_precision as price_precision',
        'pairs.amount_precision as amount_precision',
        'pairs.minimum_amount as minimum_amount',
        'pairs.minimum_total as minimum_total',
        'pairs.group_count as group_count',
        'quote_coin.name as quote_name',
        'base_coin.name as base_name',
        'base_coin.symbol as base_symbol',
        'base_coin.type as base_type',
        'base_coin.stellar_issuer as base_stellar_issuer',
        'base_coin.bsc_address as base_bsc_address',
        'base_coin.decimal as base_decimal',
        'quote_coin.symbol as quote_symbol',
        'quote_coin.type as quote_type',
        'quote_coin.stellar_issuer as quote_stellar_issuer',
        'quote_coin.bsc_address as quote_bsc_address',
        'quote_coin.decimal as quote_decimal',
      ])
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id');
  }

  async getPairById(id: number): Promise<PairCoin> {
    return await this.getBaseQueryForPairCoin().where('pairs.id = :id', { id: id }).getRawOne();
  }

  async getPairByBscTokens(baseAddress: string, quoteAddress: string): Promise<PairCoin> {
    return await this.getBaseQueryForPairCoin()
      .where('base_coin.bsc_address = :baseAddress', { baseAddress })
      .andWhere('quote_coin.bsc_address = :quoteAddress', { quoteAddress })
      .getRawOne();
  }

  async getPairsByCondition(
    pairFilter?: PairFilterDto,
    page?: number,
    limit?: number,
  ): Promise<Response<Partial<PairCoin[]>>> {
    const res = await this.createQueryBuilder('pairs')
      .select([
        'pairs.id',
        'pairs.price_precision',
        'pairs.amount_precision',
        'pairs.minimum_amount',
        'pairs.minimum_total',
        'pairs.is_active',
        'quote_coin.id as quote_id',
        'base_coin.id as base_id',
        'base_coin.symbol as base_symbol',
        'base_coin.stellar_issuer as base_stellar_issuer',
        'base_coin.bsc_address',
        'quote_coin.symbol as quote_symbol',
        'quote_coin.stellar_issuer as quote_stellar_issuer',
        'quote_coin.bsc_address',
      ])
      .innerJoin('coins', 'base_coin', 'base_coin.id = pairs.base_id')
      .innerJoin('coins', 'quote_coin', 'quote_coin.id = pairs.quote_id');
    if (pairFilter?.status || pairFilter?.status === 0) {
      res.where('pairs.is_active = :status', { status: pairFilter.status });
    }
    if (pairFilter?.base_coin_symbol) {
      res.andWhere(`base_coin.symbol like :baseCoinSym`, { baseCoinSym: `%${pairFilter.base_coin_symbol}%` });
    }
    const [rs, total] = await Promise.all([
      res
        .limit(limit)
        .offset((page - 1) * limit)
        .getRawMany(),
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
}
