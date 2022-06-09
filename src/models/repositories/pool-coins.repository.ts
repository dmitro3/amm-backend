import { EntityRepository, Repository } from 'typeorm';
import { PoolCoin } from 'src/models/entities/pool-coins.entity';

@EntityRepository(PoolCoin)
export class PoolCoinRepository extends Repository<PoolCoin> {}
