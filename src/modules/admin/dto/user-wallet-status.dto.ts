import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserWalletStatusDto {
  @ApiProperty({
    required: true,
    example: [1, 2],
  })
  ids: number[];

  @ApiProperty({
    required: true,
  })
  status: number;
}
