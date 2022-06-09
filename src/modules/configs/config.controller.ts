/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from 'src/modules/configs/config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  getPairConfig(@Query('from') from: string, @Query('to') to: string) {
    return this.configService.getPairConfig(from, to);
  }
}
