import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(FunctionalCurrencyUsers)
export class FunctionalCurrencyUserRepository extends Repository<FunctionalCurrencyUsers> {}
