import { GraduallyEntity } from 'src/models/entities/gradually.entity';
import { EntityRepository, Repository } from 'typeorm';
import { SearchGraduallyDto } from 'src/modules/gradually/dto/search-gradually.dto';

@EntityRepository(GraduallyEntity)
export class GraduallyRepository extends Repository<GraduallyEntity> {
  async get(search: SearchGraduallyDto): Promise<GraduallyEntity[]> {
    const condition = search.pool_address ? { pool_address: search.pool_address } : {};
    return this.find({
      where: condition,
      skip: (search.page - 1) * search.size,
      take: search.size,
    });
  }

  async countTotal(): Promise<number> {
    return this.count();
  }
}
