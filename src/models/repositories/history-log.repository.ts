import { Between, EntityRepository, Repository } from 'typeorm';
import { HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { SearchHistoryLogDto } from 'src/modules/history-log/dto/search-history-log.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';

@EntityRepository(HistoryLogEntity)
export class HistoryLogRepository extends Repository<HistoryLogEntity> {
  async searchByCondition(searchCondition: SearchHistoryLogDto): Promise<Response<HistoryLogEntity[]>> {
    const conditions = {
      created_at: Between(searchCondition.from, searchCondition.to),
    };
    if (searchCondition.admin_id) conditions['admin_id'] = searchCondition.admin_id;
    if (searchCondition.activity_type) conditions['activity_type'] = searchCondition.activity_type;
    const [rs, total] = await Promise.all([
      this.find({
        where: conditions,
        skip: (searchCondition.page - 1) * searchCondition.size,
        take: searchCondition.size,
        order: { created_at: searchCondition.created_at },
      }),
      this.count(),
    ]);
    return {
      data: rs,
      metadata: {
        page: searchCondition.page,
        size: searchCondition.size,
        totalPage: Math.ceil(total / searchCondition.size),
      },
    };
  }
}
