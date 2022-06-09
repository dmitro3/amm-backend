import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { SearchTradeDto } from 'src/modules/orders/dto/search_trade.dto';
import { GetChartInfoDto } from 'src/modules/trades/dto/chart-info-request.dto';
import { ConditionTransactionDto } from 'src/modules/trades/dto/condition-transaction.dto';
import { TradeElement } from 'src/modules/trades/dto/trade-element.dto';
import { TradeService } from 'src/modules/trades/trades.service';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { TradingMethod } from 'src/shares/enums/trading-method';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';

@Controller('trades')
@ApiTags('Order')
@ApiBearerAuth()
export class TradesController {
  constructor(private tradeService: TradeService) {}

  @ApiOperation({
    description: 'Get trade history',
  })
  @Get('/bars')
  prepareChartInfo(@Query() requestDto: GetChartInfoDto): Promise<TradeElement[]> {
    return this.tradeService.prepareChartInfo(requestDto);
  }

  @ApiOperation({
    description: 'Get trade history',
  })
  @Get('/list')
  async getListTradeHistory(
    @Query() { page, limit }: PaginationInput,
    @Query() searchOrderDto: SearchTradeDto,
    @UserID() userId: number,
  ): Promise<Response<TradeEntity[]>> {
    searchOrderDto.userId = userId;
    return this.tradeService.getAllTrades(searchOrderDto, page, limit);
  }

  @ApiOperation({
    description: 'Get trades',
  })
  @Get('/')
  async getMarketTrades(
    @Query('pair_id') pairId: number,
    @Query('method') method: TradingMethod,
  ): Promise<TradeEntity[]> {
    return await this.tradeService.getMarketTrades(pairId, method);
  }

  @ApiOperation({
    summary: 'Get trade liquidity',
  })
  @Post('/getTransactionLiq')
  async getTradeSwap(@Body() condition: ConditionTransactionDto, @UserID() userId: number): Promise<unknown> {
    condition.userId = userId;
    return this.tradeService.getTradeLiquidity(condition);
  }
}
