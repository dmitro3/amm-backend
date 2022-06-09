import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  id: number;
  @ApiProperty({
    required: true,
  })
  user_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  pair_id: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  type: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  side: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  price: string;

  average: string;

  amount: string;

  filled_amount: string;

  remaining_amount: string;

  total: string;

  status: number;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  method: number;

  fee_rate: string;

  address: string;

  maker_token: string;

  taker_token: string;

  maker_amounts: string;

  taker_amounts: string;

  sender: string;

  maker: string;

  taker: string;

  @IsNotEmpty()
  taker_token_fee_amounts: string;

  fee_recipient: string;

  pool_id: string;

  expiry: number;

  salt: string;

  signature: string;

  stellar_id: string;

  order_hash: string;

  created_at: Date;
  updated_at: Date;
}
