import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Command, Console } from 'nestjs-console';
import { Coin } from 'src/models/entities/coin.entity';
import { FunctionalCurrency } from 'src/models/entities/functional-currency.entity';
import { PairEntity } from 'src/models/entities/pair.entity';
import { TradingFee } from 'src/models/entities/trading-fee.entity';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { TradingFeeService } from 'src/modules/tradingfee/tradingfee.service';
import { Network } from 'src/shares/enums/network';

@Console()
@Injectable()
export class SeederConsole {
  constructor(
    private readonly tradingFeeService: TradingFeeService,
    @InjectRepository(CoinRepository, 'master')
    public readonly coinRepo: CoinRepository,
    @InjectRepository(PairRepository, 'master')
    public readonly pairRepo: PairRepository,
    @InjectRepository(FunctionalCurrencyRepository, 'master')
    private readonly currencyRepository: FunctionalCurrencyRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(SeederConsole.name);
  }

  @Command({
    command: 'seed',
    description: 'Seed data',
  })
  async seed(): Promise<void> {
    await this.seedCoins();
    await this.seedPairs();
    await this.seedTradingFees();
    await this.seedCurrencies();
  }

  private async seedCoins(): Promise<void> {
    await this.coinRepo.insert(
      this.createCoin(
        1,
        'vUSD',
        'vUSD',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0x6dEeeebCf2b03a1078D1FC624bdC57a667BF31d0',
      ),
    );
    await this.coinRepo.insert(
      this.createCoin(
        2,
        'vTHB',
        'vTHB',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0xdBa79A8049F52565de7Bc190d5B56a21A5959459',
      ),
    );
    await this.coinRepo.insert(
      this.createCoin(
        3,
        'vEUR',
        'vEUR',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0x7b47880B3B14Ec45023E2240C1f5358b0165FfD7',
      ),
    );
    await this.coinRepo.insert(
      this.createCoin(
        4,
        'vSGD',
        'vSGD',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0x332A96a808cfe9E3560E0d261d8b047bb6B85b4D',
      ),
    );
    await this.coinRepo.insert(
      this.createCoin(
        5,
        'vCHF',
        'vCHF',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0x1FDEe622a8c058923e4d006c3edeE14a0634E9d2',
      ),
    );
    await this.coinRepo.insert(
      this.createCoin(
        6,
        'USDT',
        'USDT',
        'GAXXMQMTDUQ4YEPXJMKFBGN3GETPJNEXEUHFCQJKGJDVI3XQCNBU3OZI',
        '0x84544B0815279361676Fd147dAd60a912D8CaAc0',
      ),
    );
  }

  private createCoin(
    id: number,
    name: string,
    symbol: string,
    stellarIssuer: string,
    bscAddress: string,
    decimal = 18,
    type = 2,
  ): Coin {
    const coin = new Coin();
    coin.id = id;
    coin.name = name;
    coin.symbol = symbol;
    coin.stellar_issuer = stellarIssuer;
    coin.bsc_address = bscAddress;
    coin.decimal = decimal;
    coin.type = type;
    return coin;
  }

  private async seedPairs(): Promise<void> {
    await this.pairRepo.insert(this.createPair(1, 3, 1, '0.00001', '0.01', '1', '1', 5));
    await this.pairRepo.insert(this.createPair(2, 3, 2, '0.0001', '0.01', '1', '1', 4));
    await this.pairRepo.insert(this.createPair(3, 3, 4, '0.00001', '0.01', '1', '1', 5));
    await this.pairRepo.insert(this.createPair(4, 3, 5, '0.00001', '0.01', '1', '1', 5));
    await this.pairRepo.insert(this.createPair(5, 1, 2, '0.0001', '0.01', '1', '1', 4));
    await this.pairRepo.insert(this.createPair(6, 1, 4, '0.00001', '0.01', '1', '1', 5));
    await this.pairRepo.insert(this.createPair(7, 1, 5, '0.00001', '0.01', '1', '1', 5));
    await this.pairRepo.insert(this.createPair(8, 2, 5, '0.0001', '0.01', '1', '1', 4));
    await this.pairRepo.insert(this.createPair(9, 2, 4, '0.0001', '0.01', '1', '1', 4));
    await this.pairRepo.insert(this.createPair(10, 6, 2, '0.000001', '0.01', '1', '1', 6));
    await this.pairRepo.insert(this.createPair(11, 6, 1, '0.000001', '0.01', '1', '1', 6));
  }

  private createPair(
    id: number,
    baseId: number,
    quoteId: number,
    pricePrecision: string,
    amountPrecision: string,
    minimumAmount: string,
    minimumTotal: string,
    groupCount: number,
  ): PairEntity {
    const pair = new PairEntity();
    pair.id = id;
    pair.base_id = baseId;
    pair.quote_id = quoteId;
    pair.price_precision = pricePrecision;
    pair.amount_precision = amountPrecision;
    pair.minimum_amount = minimumAmount;
    pair.minimum_total = minimumTotal;
    pair.group_count = groupCount;
    return pair;
  }

  private async seedTradingFees(): Promise<void> {
    let tradingFee = new TradingFee();
    tradingFee.id = 1;
    tradingFee.name = 'Stellar';
    tradingFee.market_order = '0.0015';
    tradingFee.limit_order = '0.0015';
    tradingFee.network = Network.Stellar;
    await this.tradingFeeService.create(tradingFee);

    tradingFee = new TradingFee();
    tradingFee.id = 2;
    tradingFee.name = 'BSC';
    tradingFee.market_order = '0.0015';
    tradingFee.limit_order = '0.0015';
    tradingFee.network = Network.BSC;
    await this.tradingFeeService.create(tradingFee);
  }

  private async seedCurrencies(): Promise<void> {
    await this.currencyRepository.insert(this.createCurrency('USD', 'USD', '$', 'vUSD', 1));
    await this.currencyRepository.insert(this.createCurrency('EUR', 'EUR', '€', 'vEUR', 2));
    await this.currencyRepository.insert(this.createCurrency('THB', 'THB', '฿', 'vTHB', 3));
    await this.currencyRepository.insert(this.createCurrency('SGD', 'SGD', '$', 'vSGD', 4));
    await this.currencyRepository.insert(this.createCurrency('CHF', 'CHF', 'Fr.', 'vCHF', 5));
    await this.currencyRepository.insert(this.createCurrency('JPY', 'JPY', '¥', 'vJPY', 6));
    await this.currencyRepository.insert(this.createCurrency('GBP', 'GBP', '£', 'vGBP', 7));
    await this.currencyRepository.insert(this.createCurrency('CNY (CNH)', 'CNY', '¥', 'vCNY', 8));
    await this.currencyRepository.insert(this.createCurrency('KRW', 'KRW', '₩', 'vKRW', 9));
    await this.currencyRepository.insert(this.createCurrency('TWD', 'TWD', '$', 'vTWD', 10));
  }

  private createCurrency(
    name: string,
    isoCode: string,
    symbol: string,
    digitalCredit: string,
    index: number,
  ): FunctionalCurrency {
    const currency = new FunctionalCurrency();
    currency.id = index;
    currency.currency = name;
    currency.symbol = symbol;
    currency.iso_code = isoCode;
    currency.digital_credits = digitalCredit;
    currency.fractional_unit = 0;
    currency.number_basic = index;
    return currency;
  }
}
