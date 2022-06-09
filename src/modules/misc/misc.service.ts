import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { XE_CURRENCIES } from 'src/modules/cache/cache.constant';
import { ExchangeRate } from 'src/modules/misc/dto/xe.dto';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';

@Injectable()
export class MiscService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(FunctionalCurrencyRepository, 'report')
    private functionalCurrencyReport: FunctionalCurrencyRepository,
  ) {}

  async getExchangeRates(date = undefined): Promise<ExchangeRate[]> {
    const keyCache = date ? `${XE_CURRENCIES}_${date}` : XE_CURRENCIES;
    return (await this.cacheManager.get(keyCache)) ?? [];
  }
}
