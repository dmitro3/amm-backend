import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UserOptionalDto {
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_id: number;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  user_type: number;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  role: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  network: string;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  status: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  create_at_sort: 'ASC' | 'DESC';
}
