import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ExchangeRate } from 'src/modules/misc/dto/xe.dto';
import { MiscService } from 'src/modules/misc/misc.service';

@Controller('misc')
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

  @ApiOperation({
    description: 'Get exchange rates',
  })
  @Get('/exchange-rates')
  async getXeCurrencies(@Query() query: { date: string }): Promise<ExchangeRate[]> {
    return await this.miscService.getExchangeRates(query.date);
  }
}
