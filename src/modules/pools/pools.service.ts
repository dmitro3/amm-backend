import { PoolEntity, PoolStatus } from 'src/models/entities/pool.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { PoolRepository } from 'src/models/repositories/pool.repository';
import { plainToClass } from 'class-transformer';
import { ChangePoolRequestStatusDto } from 'src/modules/admin/dto/poll-request-status.dto';
import { PoolRequestFilterDto } from 'src/modules/admin/dto/pool-request-filter.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { Connection, getConnection } from 'typeorm';
import { CreatePoolDto } from 'src/modules/pools/dto/create-pool.dto';
import { PoolCoin } from 'src/models/entities/pool-coins.entity';
import { NotificationEntity, NotificationType } from 'src/models/entities/notification.entity';

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(PoolRepository, 'master')
    public readonly poolsRepoMaster: PoolRepository,
    @InjectRepository(PoolRepository, 'report')
    public readonly poolsRepoReport: PoolRepository,
    @InjectRepository(PairRepository, 'master')
    public readonly pairRepoMaster: PairRepository,
    @InjectRepository(PairRepository, 'report')
    public readonly pairRepoReport: PairRepository,
    @InjectRepository(CoinRepository, 'master')
    public readonly coinRepoMaster: CoinRepository,
    @InjectRepository(CoinRepository, 'report')
    public readonly coinRepoReport: CoinRepository,
    @InjectConnection('master')
    private connection: Connection,
  ) {}

  async createPool(poolDto: CreatePoolDto): Promise<void> {
    await this.connection.transaction(async (manager) => {
      const poolEntity = plainToClass(PoolEntity, poolDto, { excludeExtraneousValues: true });
      if (poolDto.flex_right_config) {
        poolEntity.flex_right_config = JSON.parse(poolDto.flex_right_config);
      }
      const pool = await manager.save(PoolEntity, poolEntity);

      const listPoolCoins = poolDto.coin_ids.map((val, index) => {
        return {
          pool_id: pool.id,
          coin_id: val,
          weight: poolDto.weight[index],
        };
      });
      await manager.save(PoolCoin, listPoolCoins);
    });
  }

  async getPoolRequests(filter: PoolRequestFilterDto, page?: number, limit?: number): Promise<Response<PoolEntity[]>> {
    return await this.poolsRepoReport.getPoolRequests(filter, page, limit);
  }

  async getPoolRequest(id: number): Promise<PoolEntity> {
    return this.poolsRepoReport.getPoolRequest(id);
  }

  async updatePoolRequest(id: number, updatePoolRequestDto: ChangePoolRequestStatusDto): Promise<PoolEntity> {
    const poolRequest = await this.getPoolRequest(id);
    if (!poolRequest) {
      throw new HttpException({ key: 'pool.NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    if (poolRequest.status !== PoolStatus.Pending) {
      throw new HttpException({ key: 'pool.CANNOT_UPDATE_STATUS' }, HttpStatus.BAD_REQUEST);
    }
    if (![PoolStatus.Created, PoolStatus.Rejected].includes(updatePoolRequestDto.status)) {
      throw new HttpException({ key: 'pool.INVALID_STATUS' }, HttpStatus.BAD_REQUEST);
    }
    const status = updatePoolRequestDto.status === PoolStatus.Created ? 'approve' : 'rejected';
    const notification = NotificationEntity.createNotification(
      -1,
      NotificationType.PoolRequest,
      `Your pool request has been ${status} by Velo admin ${poolRequest.id}`,
    );
    poolRequest.status = updatePoolRequestDto.status;
    poolRequest.message = updatePoolRequestDto.message;
    poolRequest.pool_address = updatePoolRequestDto.poolAddress;
    await getConnection('master').transaction(async (transaction) => {
      await transaction.save(notification);
      return await transaction.save(poolRequest);
    });
    return poolRequest;
  }
}
