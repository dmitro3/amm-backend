import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class SearchOrderDto {
  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  pair: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  method: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  wallet: string;

  @ApiPropertyOptional({ type: Number, required: true })
  @IsOptional()
  userId: number;

  @ApiPropertyOptional({ type: Number, required: true })
  @IsOptional()
  @IsArray()
  status: number[];

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  page: number;

  @ApiPropertyOptional({ type: Number, required: false })
  @IsOptional()
  limit: number;
}
