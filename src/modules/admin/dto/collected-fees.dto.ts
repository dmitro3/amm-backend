import { ApiProperty } from '@nestjs/swagger';
export class CollectedFeesDto {
  @ApiProperty({
    required: false,
  })
  startTime: number;

  @ApiProperty({
    required: false,
  })
  endTime: number;

  @ApiProperty({
    required: false,
  })
  poolAddress: string;

  @ApiProperty({
    required: false,
  })
  methods: number[];

  @ApiProperty({
    required: false,
  })
  pair: number;

  @ApiProperty({
    required: false,
  })
  interval: number;

  @ApiProperty({
    required: false,
  })
  timestamps: number[];
}
