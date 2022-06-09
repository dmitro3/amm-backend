import { PoolEntity, PoolStatus } from 'src/models/entities/pool.entity';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PoolsService } from 'src/modules/pools/pools.service';
import { CreatePoolDto } from 'src/modules/pools/dto/create-pool.dto';
import { I18nService } from 'nestjs-i18n';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';

@ApiTags('pools')
@Controller('pools')
export class PoolsController {
  constructor(private poolsService: PoolsService, private readonly i18n: I18nService) {}

  @Post('/create')
  async create(@Body() poolDto: CreatePoolDto, @UserID() userId: number): Promise<PoolEntity> {
    poolDto.user_id = userId;
    poolDto.status = PoolStatus.Pending;
    await this.poolsService.createPool(poolDto);

    return this.i18n.translate('success', {});
  }
}
