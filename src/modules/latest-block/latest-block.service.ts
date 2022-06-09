import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LatestBlockRepository } from 'src/models/repositories/latest-block.repository';
import { LatestBlockEntity } from 'src/models/entities/latest-block.entity';

@Injectable()
export class LatestBlockService {
  constructor(
    @InjectRepository(LatestBlockRepository, 'master')
    public readonly latestBlockRepo: LatestBlockRepository,
  ) {}

  async saveLatestBlock(currency: string, type: string, block: string): Promise<void> {
    const latestBlock = new LatestBlockEntity();
    latestBlock.block = block;
    await this.latestBlockRepo.update({ network: currency, type }, latestBlock);
  }

  async getLatestBlock(currency: string, type: string): Promise<LatestBlockEntity> {
    let latestBlock = await this.latestBlockRepo.findOne({ network: currency, type });
    if (!latestBlock) {
      latestBlock = new LatestBlockEntity();
      latestBlock.network = currency;
      latestBlock.type = type;
      await this.latestBlockRepo.insert(latestBlock);
    }
    return latestBlock;
  }
  async updateLatestBlockStatus(latestBlock: LatestBlockEntity): Promise<LatestBlockEntity> {
    return await this.latestBlockRepo.save(latestBlock);
  }
}
