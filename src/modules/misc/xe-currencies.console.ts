// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, Console } from 'nestjs-console';
import { getConfig } from 'src/configs';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { Cache } from 'cache-manager';
import { CallApi } from 'src/shares/helpers/call-api.helper';
import { TIME_LIVE_XE_CURRENCIES_CACHE, XE_CURRENCIES } from 'src/modules/cache/cache.constant';

const baseUrl = getConfig().get<string>('xe_currencies.fixer_api_currencies');
const accessKey = getConfig().get<string>('xe_currencies.fixer_access_key');
const baseCurrency = getConfig().get<string>('xe_currencies.fixer_base_currency');

@Console()
export class XeCurrenciesConsole {
  constructor(
    @InjectRepository(FunctionalCurrencyRepository, 'report')
    private readonly currencyRepository: FunctionalCurrencyRepository,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {}
  @Command({
    command: 'crawl-exchange-rate',
    description: 'Get exchange rate of currencies from fixer',
  })
  async getExchangeRates(): Promise<void> {
    const date = new moment(new Date()).format('YYYY-MM-DD');
    const data = await CallApi(`${baseUrl}?access_key=${accessKey}&base=${baseCurrency}`, {}, 'GET');
    const res = await data.json();
    if (res.success) {
      const currencies = [];
      for (const coin in res.rates) {
        currencies.push({
          coin: coin,
          rate: res.rates[coin],
        });
      }
      await this.cacheManager.set(XE_CURRENCIES, currencies, { ttl: TIME_LIVE_XE_CURRENCIES_CACHE });
      await this.cacheManager.set(`${XE_CURRENCIES}_${date}`, currencies, { ttl: TIME_LIVE_XE_CURRENCIES_CACHE });
    }
  }
}
