import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PairService } from './pair.service';
import { PairCoin } from 'src/modules/trades/dto/pair-coin.dto';
import { PairFilterDto } from 'src/modules/pairs/dto/pairfilter.dto';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Controller('pair')
@ApiTags('Pair')
export class PairController {
  constructor(private readonly pairService: PairService) {}

  @ApiOperation({
    description: 'Get all pairs',
  })
  @Get('/list')
  async getListPairs(): Promise<PairCoin[]> {
    return await this.pairService.getAllPairs();
  }
  @Get('/filter')
  async getPairsByCondition(
    @Query() { page, limit }: PaginationInput,
    @Query() pairFilter: PairFilterDto,
  ): Promise<Response<Partial<PairCoin[]>>> {
    return this.pairService.getPairsByCondition(pairFilter, page, limit);
  }
}
