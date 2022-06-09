import { Between, EntityRepository, Repository } from 'typeorm';
import { PoolPnlEntity } from 'src/models/entities/pool_pnl.entity';
import { PoolPnlsPrimaryKeyDto } from 'src/modules/users/dto/pnls-primary-key.dto';

@EntityRepository(PoolPnlEntity)
export class PoolPnlRepository extends Repository<PoolPnlEntity> {
  async getOneByPrimaryKey(poolPnlsPrimaryKeyDto: PoolPnlsPrimaryKeyDto): Promise<PoolPnlEntity> {
    return this.findOne({
      where: poolPnlsPrimaryKeyDto,
    });
  }

  async getDataForUserByRangeDate(
    fromDate: string,
    toDate: string,
    userId: number,
    wallet = null,
  ): Promise<PoolPnlEntity[]> {
    const condition = {
      date: Between(fromDate, toDate),
      user_id: userId,
    };
    if (wallet) condition['wallet'] = wallet;
    return this.find({
      where: condition,
    });
  }
}
