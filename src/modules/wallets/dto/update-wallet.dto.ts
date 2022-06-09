import { ApiProperty } from '@nestjs/swagger';

export class UpdateWalletDto {
  @ApiProperty({
    required: false,
  })
  ids: number[];

  @ApiProperty({
    required: false,
  })
  status: number;

  @ApiProperty({
    required: false,
  })
  address: string;
}
