import { EntityRepository, Repository } from 'typeorm';
import { IntervalSettings } from 'src/models/entities/interval-settings.entity';
import { Response } from 'src/shares/interceptors/response.interceptor';

@EntityRepository(IntervalSettings)
export class IntervalSettingRepository extends Repository<IntervalSettings> {
  async getAllInterval(page?: number, limit?: number): Promise<Response<Partial<IntervalSettings[]>>> {
    const res = await this.createQueryBuilder('interval_settings').select('*');
    const [rs, total] = await Promise.all([
      res
        .limit(limit)
        .offset((page - 1) * limit)
        .getRawMany(),
      res.getCount(),
    ]);
    return {
      data: rs,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }
}
