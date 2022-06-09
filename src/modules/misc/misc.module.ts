import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { MiscService } from './misc.service';
import { MiscController } from './misc.controller';
import { XeCurrenciesConsole } from 'src/modules/misc/xe-currencies.console';
import * as redisStore from 'cache-manager-redis-store';
import { redisConfig } from 'src/configs/redis.config';
import { MiscConsole } from './misc.console';

@Module({
  imports: [
    TypeOrmModule.forFeature([FunctionalCurrencyRepository], 'report'),
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
  ],
  controllers: [MiscController],
  providers: [MiscService, XeCurrenciesConsole, MiscConsole],
  exports: [MiscService],
})
export class MiscModule {}
