import { ApiProperty } from '@nestjs/swagger';

export class GetPnlDto {
  @ApiProperty({
    required: true,
  })
  from: number;

  @ApiProperty({
    required: true,
  })
  to: number;

  @ApiProperty({
    required: true,
  })
  wallet: string;
}
