import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FunctionalCurrencyService } from 'src/modules/functional-currency/functional-currency.service';
import { FunctionalCurrencyDto } from 'src/modules/functional-currency/dto/functional-currency.dto';
import { CreateFunctionalCurrencyDto } from 'src/modules/functional-currency/dto/create-fc.dto';
import { FunctionalCurrency } from 'src/models/entities/functional-currency.entity';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';
import { userIdDto } from 'src/modules/users/dto/userId.dto';

@Controller('functional-currency')
@ApiTags('Functional Currency')
export class FunctionalCurrencyController {
  constructor(private funCurService: FunctionalCurrencyService) {}

  @Get()
  async getFunctionalCurrency(): Promise<FunctionalCurrencyDto[]> {
    return this.funCurService.findAll();
  }

  @Get('/get-user_id')
  @ApiQuery({
    name: 'userId',
    type: Number,
    description: 'id of user',
  })
  async getCurrenciesByUserId(@Query() { userId }: userIdDto): Promise<Partial<FunctionalCurrencyUsers[]>> {
    return await this.funCurService.getCurrenciesByUserId(userId);
  }

  @Post()
  async create(@Body() currencyDto: CreateFunctionalCurrencyDto): Promise<FunctionalCurrency> {
    const currency = await this.funCurService.create(currencyDto);
    return currency;
  }
}
