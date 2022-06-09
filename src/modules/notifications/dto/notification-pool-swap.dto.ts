import { ApiProperty } from '@nestjs/swagger';

export class NotificationPoolSwapDto {
  @ApiProperty({
    required: true,
  })
  poolId: string;
  @ApiProperty({
    required: true,
  })
  oldValue: string;
  @ApiProperty({
    required: true,
  })
  newValue: string;
}
