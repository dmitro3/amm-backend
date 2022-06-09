import { ApiProperty } from '@nestjs/swagger';

export class UpdateTradingFeeDto {
  @ApiProperty({
    required: true,
    description: 'market order',
  })
  market_order: string;

  @ApiProperty({
    required: true,
    description: 'limit order',
  })
  limit_order: string;

  @ApiProperty({
    required: false,
    description: 'user update',
  })
  email: string;

  @ApiProperty({
    required: false,
    description: 'user id',
  })
  userId: number;

  @ApiProperty({
    required: false,
    description: 'Order book name',
  })
  orderBookName: string;
}
