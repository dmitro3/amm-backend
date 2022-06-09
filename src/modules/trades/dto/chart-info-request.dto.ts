import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class GetChartInfoDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  startTime: number;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  endTime: number;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  interval: number;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  pairId: number;

  @IsNotEmpty()
  network: number[];
}
