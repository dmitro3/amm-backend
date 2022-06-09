import { ApiProperty } from '@nestjs/swagger';

export class AdminGetPnlDto {
  @ApiProperty({
    required: true,
  })
  from: number;

  @ApiProperty({
    required: true,
  })
  to: number;

  wallet: string;

  @ApiProperty({
    required: true,
  })
  user_id: number;
}
