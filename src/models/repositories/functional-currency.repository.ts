import { FunctionalCurrency } from 'src/models/entities/functional-currency.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(FunctionalCurrency)
export class FunctionalCurrencyRepository extends Repository<FunctionalCurrency> {}
