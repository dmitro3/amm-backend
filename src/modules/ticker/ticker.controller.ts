import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TickerService } from 'src/modules/ticker/ticker.service';
import { Ticker } from 'src/modules/ticker/ticker.interface';

@Controller('ticker')
@ApiTags('Ticker')
export class TickerController {
  constructor(private tickerService: TickerService) {}

  @ApiOperation({
    description: 'Get 24h ticker',
  })
  @Get('/24h')
  async getTicker24h(): Promise<Ticker[]> {
    return await this.tickerService.get24hTicker();
  }
}
