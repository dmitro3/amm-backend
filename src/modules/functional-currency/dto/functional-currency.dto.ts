import { Expose } from 'class-transformer';

export class FunctionalCurrencyDto {
  @Expose()
  id: number;

  @Expose()
  currency: string;

  @Expose()
  symbol: string;

  @Expose()
  iso_code: string;

  @Expose()
  digital_credits: string;

  @Expose()
  fractional_unit: string;

  @Expose()
  number_basic: number;
}
