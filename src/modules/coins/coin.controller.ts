import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Coin } from 'src/models/entities/coin.entity';
import { CoinService } from 'src/modules/coins/coin.service';

@Controller('coins')
@ApiTags('Coin')
export class CoinController {
  constructor(private readonly coinService: CoinService, private readonly i18n: I18nService) {}

  @ApiOperation({
    description: 'Get all Coins',
  })
  @Get('/list')
  async getListCoins(): Promise<Coin[]> {
    return await this.coinService.getAllCoins();
  }
}
