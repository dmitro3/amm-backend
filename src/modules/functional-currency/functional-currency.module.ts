import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FunctionalCurrency } from 'src/models/entities/functional-currency.entity';
import { FunctionalCurrencyService } from 'src/modules/functional-currency/functional-currency.service';
import { FunctionalCurrencyController } from 'src/modules/functional-currency/functional-currency.controller';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FunctionalCurrency]), TypeOrmModule.forFeature([FunctionalCurrencyUsers])],
  providers: [FunctionalCurrencyService],
  controllers: [FunctionalCurrencyController],
  exports: [FunctionalCurrencyService],
})
export class FunctionalCurrencyModule {}
