import { ApiProperty } from '@nestjs/swagger';
import { PoolStatus } from 'src/models/entities/pool.entity';

export class ChangePoolRequestStatusDto {
  @ApiProperty({
    required: true,
  })
  status: PoolStatus;

  @ApiProperty({
    required: false,
  })
  message: string;

  @ApiProperty({
    required: false,
  })
  poolAddress: string;
}
