import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraduallyRepository } from 'src/models/repositories/gradually.respository';
import { CreateGraduallyDto } from 'src/modules/gradually/dto/create-gradually.dto';
import { GraduallyEntity } from 'src/models/entities/gradually.entity';
import { SearchGraduallyDto } from './dto/search-gradually.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Injectable()
export class GraduallyService {
  constructor(
    @InjectRepository(GraduallyRepository, 'master')
    private graduallyRepoMaster: GraduallyRepository,
    @InjectRepository(GraduallyRepository, 'report')
    private graduallyRepoReport: GraduallyRepository,
  ) {}

  async createUpdate(createGraduallyDto: CreateGraduallyDto): Promise<GraduallyEntity> {
    const gradually = await this.graduallyRepoReport.findOne({
      where: { pool_address: createGraduallyDto.pool_address },
    });

    if (gradually) {
      gradually.start_block = createGraduallyDto.start_block;
      gradually.end_block = createGraduallyDto.end_block;
      gradually.old_weights = createGraduallyDto.old_weights;
      gradually.new_weights = createGraduallyDto.new_weights;
      return await this.graduallyRepoMaster.save(gradually);
    }

    return await this.graduallyRepoMaster.save(createGraduallyDto);
  }

  async get(search: SearchGraduallyDto): Promise<Response<Partial<GraduallyEntity[]>>> {
    const data = await this.graduallyRepoReport.get(search);
    const total = await this.graduallyRepoReport.countTotal();
    return {
      data: data,
      metadata: {
        page: Number(search.page),
        limit: Number(search.size),
        totalItem: total,
        totalPage: Math.ceil(total / search.size),
      },
    };
  }

  async delete(poolAddress: string): Promise<boolean> {
    const result = await this.graduallyRepoMaster.delete({
      pool_address: poolAddress,
    });
    return result.affected > 0;
  }
}
