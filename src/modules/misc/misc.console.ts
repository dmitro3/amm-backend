import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Console } from 'nestjs-console';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { Cache } from 'cache-manager';

@Console()
export class MiscConsole {
  constructor(
    @InjectRepository(FunctionalCurrencyRepository, 'report')
    private readonly currencyRepository: FunctionalCurrencyRepository,
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {}
}
