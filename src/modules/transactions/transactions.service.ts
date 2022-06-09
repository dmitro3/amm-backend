import { InjectRepository } from '@nestjs/typeorm';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { TransactionEntity } from 'src/models/entities/transaction.entity';

export class TransactionsService {
  constructor(
    @InjectRepository(TransactionRepository, 'master')
    public readonly txtRepoMaster: TransactionRepository,
    @InjectRepository(TransactionRepository, 'report')
    public readonly txtRepoReport: TransactionRepository,
  ) {}

  async getOnePendingTx(network: number): Promise<TransactionEntity> {
    return await this.txtRepoReport.getOnePendingTx(network);
  }

  async getOneUnsignedTxt(network: number): Promise<TransactionEntity> {
    return await this.txtRepoReport.getOneUnsignedTxt(network);
  }

  async getOneSignedTxt(network: number): Promise<TransactionEntity> {
    return await this.txtRepoReport.getOneSignedTxt(network);
  }

  async getOneSentTx(network: number): Promise<TransactionEntity> {
    return await this.txtRepoReport.getOneSentTx(network);
  }

  async updateTransaction(tradeTxt: TransactionEntity): Promise<TransactionEntity> {
    return this.txtRepoMaster.save(tradeTxt);
  }

  async getOneTxInProcess(network: number): Promise<TransactionEntity> {
    return await this.txtRepoMaster.getOneTxInProcess(network);
  }
}
