import { ApiProperty } from '@nestjs/swagger';

export class PairFilterDto {
  @ApiProperty({
    required: false,
  })
  status: number;

  @ApiProperty({
    required: false,
  })
  base_coin_symbol: string;
}
