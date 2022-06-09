import { EntityRepository, In, Repository } from 'typeorm';
import { TransactionEntity, TransactionStatus } from 'src/models/entities/transaction.entity';

@EntityRepository(TransactionEntity)
export class TransactionRepository extends Repository<TransactionEntity> {
  async getOneUnsignedTxt(network: number): Promise<TransactionEntity> {
    return await this.findOne({
      where: {
        status: TransactionStatus.Unsigned,
        network: network,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async getOnePendingTx(network: number): Promise<TransactionEntity> {
    return await this.findOne({
      where: {
        status: TransactionStatus.Pending,
        network: network,
      },
    });
  }

  async getOneSignedTxt(network: number): Promise<TransactionEntity> {
    return await this.findOne({
      where: {
        status: TransactionStatus.Signed,
        network: network,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async getOneSentTx(network: number): Promise<TransactionEntity> {
    return await this.findOne({
      where: {
        status: TransactionStatus.Sent,
        network: network,
      },
    });
  }

  async getOneTxInProcess(network: number): Promise<TransactionEntity> {
    return await this.findOne({
      where: {
        status: In([TransactionStatus.Unsigned, TransactionStatus.Signed, TransactionStatus.Sent]),
        network: network,
      },
    });
  }
}
