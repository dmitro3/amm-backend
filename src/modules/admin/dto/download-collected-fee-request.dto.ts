import { ApiProperty } from '@nestjs/swagger';

export class DownloadCollectedFeerequest {
  @ApiProperty({
    required: false,
  })
  poolAddress: string;

  @ApiProperty({
    required: false,
  })
  method: number[];

  @ApiProperty({
    required: false,
  })
  pair: number;

  @ApiProperty({
    required: false,
  })
  startTime: number;

  @ApiProperty({
    required: false,
  })
  endTime: number;
}
