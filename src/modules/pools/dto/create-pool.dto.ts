import { IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePoolDto {
  user_id: number;

  @ApiProperty({
    required: true,
    description: 'Type of pool',
  })
  @IsNotEmpty()
  type: number;

  @ApiProperty({
    required: true,
    default: [1, 2],
  })
  @IsNotEmpty()
  @IsArray()
  coin_ids: number[];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  weight: string[];

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  swap_fee: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  fee_ratio_velo: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  fee_ratio_lp: string;

  @ApiProperty({
    required: false,
    default: 1,
  })
  status: number;

  @ApiProperty({
    required: false,
    default: 'https://velo.com',
  })
  flex_right_config: string;
}
