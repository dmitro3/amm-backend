import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PoolStatus, PoolType } from 'src/models/entities/pool.entity';

export class PoolRequestFilterDto {
  @ApiProperty({
    required: false,
  })
  digital_credit: string;

  @ApiProperty({
    required: false,
  })
  type: PoolType;

  @ApiProperty({
    required: false,
  })
  user_type: number;

  @ApiProperty({
    required: false,
  })
  status: PoolStatus;

  @ApiProperty({
    required: false,
  })
  user_id: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  create_at_sort: 'ASC' | 'DESC';
}
