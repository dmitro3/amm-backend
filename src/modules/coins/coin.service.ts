import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coin } from 'src/models/entities/coin.entity';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Injectable()
export class CoinService {
  constructor(
    @InjectRepository(CoinRepository, 'master')
    public readonly CoinRepoMaster: CoinRepository,
    @InjectRepository(CoinRepository, 'report')
    public readonly CoinRepoReport: CoinRepository,
  ) {}

  async getAllCoins(): Promise<Coin[]> {
    return await this.CoinRepoReport.getAllCoins();
  }

  async getAllDigitalCreditSettings(
    digital_credit?: string,
    status?: number,
    page?: number,
    limit?: number,
  ): Promise<Response<Coin[]>> {
    return this.CoinRepoReport.getDigitalCreditSettings(digital_credit, status, page, limit);
  }
}
