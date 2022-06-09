import { EntityRepository, Repository } from 'typeorm';
import { LatestBlockEntity } from 'src/models/entities/latest-block.entity';

@EntityRepository(LatestBlockEntity)
export class LatestBlockRepository extends Repository<LatestBlockEntity> {}
