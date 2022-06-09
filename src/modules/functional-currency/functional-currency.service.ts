import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { FunctionalCurrency } from 'src/models/entities/functional-currency.entity';
import { FunctionalCurrencyEnum } from 'src/modules/functional-currency/enums/functional-currency.enum';
import { FunctionalCurrencyDto } from 'src/modules/functional-currency/dto/functional-currency.dto';
import { CreateFunctionalCurrencyDto } from 'src/modules/functional-currency/dto/create-fc.dto';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';

@Injectable()
export class FunctionalCurrencyService {
  constructor(
    @InjectRepository(FunctionalCurrency) private funCurRepository: Repository<FunctionalCurrency>,
    @InjectRepository(FunctionalCurrencyUsers) private funCuruserRepository: Repository<FunctionalCurrencyUsers>,
  ) {}

  async findAll(): Promise<FunctionalCurrencyDto[]> {
    const listFC = await this.funCurRepository.find({
      active: FunctionalCurrencyEnum.Active,
    });

    const listFCDto = plainToClass(FunctionalCurrencyDto, listFC, { excludeExtraneousValues: true });
    return listFCDto;
  }

  async create(currencyDto: CreateFunctionalCurrencyDto): Promise<FunctionalCurrency> {
    const currencyToCreate = plainToClass(FunctionalCurrency, currencyDto);
    const currency = await this.funCurRepository.save(currencyToCreate);

    return currency;
  }

  // get currencies by userid

  async getCurrenciesByUserId(userId: number): Promise<FunctionalCurrencyUsers[]> {
    const rs = await this.funCuruserRepository
      .createQueryBuilder('functional-currencies-users')
      .select([
        'functional-currencies-users.id as id',
        'functional-currencies-users.currency_id as currency_id',
        'functional-currencies-users.user_id as user_id',
        'functional-currencies-users.is_active as is_active',
        'functional-currencies-users.created_at as created_at',
        'fc.currency',
        'fc.symbol',
        'fc.iso_code',
        'fc.digital_credits',
        'fc.fractional_unit',
        'fc.number_basic',
      ])
      .innerJoin('functional_currencies', 'fc', 'currency_id = fc.id')
      .where(`user_id = ${userId}`)
      .getRawMany();
    return rs;
  }
}
