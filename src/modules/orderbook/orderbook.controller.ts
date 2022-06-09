import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderbookService } from 'src/modules/orderbook/orderbook.service';
import { Orderbook } from 'src/modules/matching-engine/output/redis-orderbook-stream';
import { PairService } from 'src/modules/pairs/pair.service';

@Controller('orderbook')
@ApiTags('Orderbook')
export class OrderbookController {
  constructor(private readonly orderbookService: OrderbookService, private readonly pairService: PairService) {}

  @ApiOperation({
    description: 'Get orderbook',
  })
  @Get('')
  async getOrderbook(@Query() param: { pair_id; base; quote }): Promise<Orderbook> {
    let pairId = param.pair_id;
    if (!pairId) {
      const pair = await this.pairService.getPairByBscTokens(param.base, param.quote);
      pairId = pair?.pairs_id || 0;
    }
    return this.orderbookService.getOrderbook(pairId);
  }
}
