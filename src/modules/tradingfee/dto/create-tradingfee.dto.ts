import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTradingFeeDto {
  @ApiProperty({
    required: true,
    description: 'name of trading fee',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    description: 'market order',
  })
  @IsNotEmpty()
  market_order: string;

  @ApiProperty({
    required: true,
    description: 'limit order',
  })
  @IsNotEmpty()
  limit_order: string;

  @ApiProperty({
    required: true,
    description: 'network',
  })
  @IsNotEmpty()
  network: number;
}
