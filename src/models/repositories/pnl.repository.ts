import { Between, EntityManager, EntityRepository, Repository } from 'typeorm';
import { PnlEntity } from 'src/models/entities/pnl.entity';
import { PnlsPrimaryKeyDto } from 'src/modules/users/dto/pnls-primary-key.dto';

@EntityRepository(PnlEntity)
export class PnlRepository extends Repository<PnlEntity> {
  async getBalanceByCondition(
    date: string,
    userId: number,
    network = undefined,
    wallet = undefined,
  ): Promise<PnlEntity[]> {
    const condition = {
      date: date,
      user_id: userId,
    };
    if (network) condition['network'] = network;
    if (wallet) condition['wallet'] = wallet;
    return this.find({
      where: condition,
    });
  }

  async getOneByPrimaryKey(pnlsPrimaryKeyDto: PnlsPrimaryKeyDto): Promise<PnlEntity> {
    return this.findOne({
      where: pnlsPrimaryKeyDto,
    });
  }

  async getDataForUserByRangeDate(
    fromDate: string,
    toDate: string,
    userId: number,
    wallet = null,
  ): Promise<PnlEntity[]> {
    const condition = {
      date: Between(fromDate, toDate),
      user_id: userId,
    };
    if (wallet) condition['wallet'] = wallet;
    return this.find({
      where: condition,
    });
  }

  async getPnlByPrimaryFromTransaction(
    pnlsPrimaryKeyDto: PnlsPrimaryKeyDto,
    transaction: EntityManager,
  ): Promise<PnlEntity> {
    return await transaction.findOne(PnlEntity, {
      where: pnlsPrimaryKeyDto,
    });
  }
}
