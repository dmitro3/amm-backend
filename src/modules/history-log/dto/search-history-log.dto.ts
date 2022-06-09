import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SearchHistoryLogDto {
  @ApiProperty({
    required: false,
    default: null,
  })
  activity_type: string;

  @ApiProperty({
    required: true,
    default: 1,
  })
  @IsNotEmpty()
  page: number;

  @ApiProperty({
    required: true,
    default: 12,
  })
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    required: true,
    default: new Date('2021-08-01'),
  })
  @IsNotEmpty()
  from: Date;

  @ApiProperty({
    required: true,
    default: new Date('2021-09-01'),
  })
  @IsNotEmpty()
  to: Date;

  @ApiProperty({
    required: false,
    default: null,
  })
  admin_id: number;

  @ApiProperty({
    required: false,
    default: 'DESC',
  })
  created_at: 'ASC' | 'DESC';
}
