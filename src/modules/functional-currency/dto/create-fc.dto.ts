import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFunctionalCurrencyDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  currency: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  symbol: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  iso_code: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  digital_credits: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  fractional_unit: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  number_basic: number;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  active: number;
}
