import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { PairFilterDto } from 'src/modules/pairs/dto/pairfilter.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { CoinRepository } from 'src/models/repositories/coin.repository';

@Injectable()
export class PairService {
  constructor(
    @InjectRepository(PairRepository, 'master')
    public readonly pairRepoMaster: PairRepository,
    @InjectRepository(PairRepository, 'report')
    public readonly pairRepoReport: PairRepository,
    @InjectRepository(CoinRepository, 'master')
    public readonly coinRepoMaster: CoinRepository,
    @InjectRepository(CoinRepository, 'report')
    public readonly coinRepoReport: CoinRepository,
  ) {}

  async getCoinByPairId(pairId: number): Promise<{ base; quote }> {
    const pair = await this.pairRepoReport.findOne(pairId);
    const [base, quote] = await Promise.all([
      this.coinRepoReport.findOne(pair.base_id),
      this.coinRepoReport.findOne(pair.quote_id),
    ]);
    return { base, quote };
  }

  async getAllPairs(): Promise<PairCoin[]> {
    return await this.pairRepoReport.getAllPairs();
  }

  async getPairById(id: number): Promise<PairCoin> {
    return await this.pairRepoReport.getPairById(id);
  }

  async getPairByBscTokens(baseAddress: string, quoteAddress: string): Promise<PairCoin> {
    return await this.pairRepoReport.getPairByBscTokens(baseAddress, quoteAddress);
  }

  async getPairsByCondition(
    pairFilter?: PairFilterDto,
    page?: number,
    limit?: number,
  ): Promise<Response<Partial<PairCoin[]>>> {
    return this.pairRepoReport.getPairsByCondition(pairFilter, page, limit);
  }
}
