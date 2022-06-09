import { Controller, Get } from '@nestjs/common';
import { TradingFeeService } from './tradingfee.service';
import { ApiTags } from '@nestjs/swagger';
import { TradingFee } from 'src/models/entities/trading-fee.entity';

@Controller('trading-fee')
@ApiTags('Trading Fee')
export class TradingFeeController {
  constructor(private readonly tradingfeeService: TradingFeeService) {}

  @Get()
  getAll(): Promise<TradingFee[]> {
    return this.tradingfeeService.findAll();
  }

  // @Post()
  // @ApiBody({
  //   type: CreateTradingFeeDto,
  // })
  // create(@Body() tradingfee: CreateTradingFeeDto): Promise<TradingFee> {
  //   return this.tradingfeeService.create(tradingfee);
  // }

  // @Delete(':id')
  // delete(@Param('id') id: number) {
  //   return this.tradingfeeService.delete(id);
  // }
}
