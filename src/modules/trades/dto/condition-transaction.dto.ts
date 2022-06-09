import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class ConditionTransactionDto {
  @ApiProperty({
    required: false,
  })
  pair?: number;

  @ApiProperty({
    required: false,
  })
  userId?: number;

  @ApiProperty({
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    required: false,
  })
  coinId?: number;

  @ApiProperty({
    required: false,
  })
  pool?: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  page?: number | 1;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
  })
  limit?: number | 20;

  @ApiProperty({
    required: true,
  })
  transactionType?: string;
}
