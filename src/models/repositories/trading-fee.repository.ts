import { EntityRepository, Repository } from 'typeorm';
import { TradingFee } from '../entities/trading-fee.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

@EntityRepository(TradingFee)
export class TradingFeeRepository extends Repository<TradingFee> {
  async getListTradingFee(): Promise<TradingFee[]> {
    return await this.createQueryBuilder('trading_fee').select('*').getRawMany();
  }

  async findOneTradingFee(id: number): Promise<Partial<TradingFee>> {
    const rs = await this.createQueryBuilder('trading_fee')
      .select('*')
      .where('trading_fee.id = :id', { id })
      .getRawOne();
    if (!rs) {
      throw new HttpException({ key: 'trading-fee.WALLET_NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    return rs;
  }

  async deleteTradingFee(id: number): Promise<Partial<TradingFee>> {
    const rs = await this.findOneTradingFee(id);
    await this.createQueryBuilder('trading_fee')
      .delete()
      .from(TradingFee)
      .where('trading_fee.id = :id', { id })
      .execute();
    return rs;
  }
}
